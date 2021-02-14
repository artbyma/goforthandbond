import {getContract} from "../../../../lib/getContract";
import {getHeartPiece} from "../../../../lib/getHeartPiece";
import fs from 'fs';
import path from 'path';
import {NextApiRequest} from "next";


export default async function page(req: NextApiRequest, res) {
  const {query: { pieceId, size }} = req;

  const artdir = path.resolve('./public', 'art');
  const script = fs.readFileSync(path.join(artdir, 'script.js'))

  const contract = await getContract();
  const info = await getHeartPiece(contract, parseInt(pieceId as string));

  res.send(`
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
        size: ${size ? parseInt(size as string) : 800},
        seed: ${info.seed},
        tokens: ${JSON.stringify(info.tokens)}
    });
    loop(true);
</script>

</body>
</html>
  `);
}