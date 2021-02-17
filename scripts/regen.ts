/**
 * This regenerates the animation for each piece, and stores in on IPFS.
 */

import fetch from 'node-fetch';
import * as hre from "hardhat";
import * as path from "path";
import * as fs from "fs";
import * as util from 'util';
import {getContract} from "../hardhat.config";
const streamPipeline = util.promisify(require('stream').pipeline)
const exec = util.promisify(require('child_process').exec);


function getRenderHTMLFile(info: {
  seed: number,
  tokens: boolean[]
}) {
  const artdir = path.resolve(__dirname, '../public', 'art');
  const script = fs.readFileSync(path.join(artdir, 'script.js'))

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            background-color: #ffffff;
            margin: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/postprocessing/BloomPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/shaders/CopyShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/shaders/ConvolutionShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/postprocessing/ShaderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/shaders/LuminosityHighPassShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.125.2/examples/js/postprocessing/UnrealBloomPass.js"></script>
<script>
    ${script}
</script>
<script>
    init({
        size: 800,
        seed: ${info.seed},
        tokens: ${JSON.stringify(info.tokens)}
    });
</script>
<script>
function getInfo() {
  return {
    fps: FPS,
    numberOfFrames: CLIP_LENGTH * FPS,
  }
}
async function seekToFrame(num) {
  setPosition(num);
  render();
  await new Promise(resolve => {
    window.setTimeout(resolve, 400)
  });
}
</script>
  `
}


async function renderPiece(pieceIdx: number, data: {
  seed: number,
  tokens: boolean[]
}) {
  const content = getRenderHTMLFile(data);
  
  // Generate the video
  const response = await fetch(`${process.env.AE_RENDER_BASE}/api/generate`, {
    method: 'POST',
    headers: {
      'Authorization': process.env.AE_RENDER_KEY
    },
    body: JSON.stringify({
      content: content
    })
  });
  const {id} = await response.json();

  console.log('waiting for render...')
  while (true) {
    let response;
    try {
      response = await fetch(`${process.env.AE_RENDER_BASE}/api/status?id=` + id, {
        method: 'GET',
        headers: {
          'Authorization': process.env.AE_RENDER_KEY
        },
      });
    } catch (e) {
      console.log('error, retrying...')
      continue;
    }

    if ((await response.json()).isReady) {
      break;
    }
  }

  console.log('download file')
  const ipfsdir = path.join(__dirname, '..', 'ipfs', 'hearts');
  const filename = path.join(ipfsdir, `${pieceIdx}.mp4`);
  await download(filename, `${process.env.AE_RENDER_BASE}/api/download?id=` + id, {
    method: 'GET',
    headers: {
      'Authorization': process.env.AE_RENDER_KEY
    },
  });
}

  console.log("Generate png")
  const command = new FfmpegCommand(filename)
      .on('end', function () {
      })
      .on('error', function (err) {
        console.log('Error: ' + err.message);
      })
      .screenshots({
        timestamps: [3],
        filename: `${pieceIdx}.png`,
        folder: ipfsdir,
      });

  return filename;
}


async function main() {
  const contract = await getContract(hre, "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const numPieces = await contract.numPieces();

  const videoFiles = [];
  for (let i=1; i<=numPieces; i++) {
    const piece = await contract.getPiece(i);
    console.log(`Rendering ${i} with seed ${piece.randomSeed.toNumber()} and states: ${piece.states.join(':')}`);
    await renderPiece(i, await {
      seed: piece.randomSeed.toNumber(),
      tokens: piece.states,
    });
  }

  console.log('Sync: ' + 'aws s3 sync --acl public-read . s3://gobond/hearts/')
}


async function download (filename: string, ...args: any[]) {
  // @ts-ignore
  const response = await fetch(...args);
  if (!response.ok) { throw new Error(`unexpected response ${response.statusText}`) }
  await streamPipeline(response.body, fs.createWriteStream(filename))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });