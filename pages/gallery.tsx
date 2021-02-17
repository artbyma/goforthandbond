/** @jsxRuntime classic /
 /** @jsx jsx */
import { css, jsx } from '@emotion/react'
import Layout from "../lib/Layout";
import {useAsyncValue} from "../lib/useAsyncValue";
import {DynamicImage} from "../lib/DynamicImage";
import {useMemo} from "react";

export default function Gallery() {
  return <Layout>
    <GalleryView />
  </Layout>
}


function GalleryView() {
  const [pieces, {loading}] = useAsyncValue(async () => {
    const response = await fetch("/api/hearts/pieces")
    return await response.json();
  }, []);

  const features = useMemo(() => {
    if (!pieces) { return; }
    return pieces.map(piece => {
      return generateFeatures(piece.seed, piece.numHearts);
    })
  }, pieces)

  if (loading) {
    return null;
  }

  return <div css={css`
    margin: 40px 0 60px 0;
    
    strong {
      display: block;
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: normal;
      border-bottom: 1px solid black;
    }
    
    .grid {
      display: flex;
      flex-wrap: wrap;
    }
    
    .item {
      display: flex;
      flex-direction: column;
      margin-right: 4px;
      margin-bottom: 15px;
    }
    
    .item > div {
      color: gray;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
    }
    
    img {
      width: 240px;
    }
    
    .feature {
      background: #607d8b;
      padding: 0.3em;
      margin: 0.1em;
      color: white;
    }
    
    .burned img {
      opacity: 0.5;
    }
    .burned .label {
      text-decoration: line-through;
      text-decoration-color: red;
      text-decoration-thickness: 3px;
    }
  `}
  >
    <h3>Gallery</h3>
    <p>
      NB: There is a delay in updating the thumbnails (should not be more than half an hour). When
      in doubt, check the live version.
    </p>
    <div className={"grid"}>
      {pieces.map((item, idx) => {
        const burned = item.numOwners == 0;

        return <div key={item.number} className={`item ${burned ? 'burned' : ""}`}>
          <a href={`/api/hearts/live/${item.number}`} target={"_blank"}>
            <DynamicImage url={`/api/hearts/image/${item.number}`} />
          </a>
          <div style={{fontSize: '12px'}} className={"label"}>
            <span>#{item.number} (<a href={`/api/hearts/live/${item.number}`} target={"_blank"}>live</a>)</span>

            <span title={"Time this piece was mintable"}>
              {formatLength(item.length)}
            </span>

            {features[idx] ? <span style={{marginLeft: '10px'}}>
              {
                features[idx].map(feature => {
                  const featureChance = {
                    isMatte: 0.4,
                    isThin: 0.3,
                    isRough: 0.15,
                    sync: 0.08
                  }[feature] || null;
                  const featureName = {
                    isMatte: 'matte',
                    isThin: 'thin',
                    fixedRotation: 'sync',
                    isRough: 'no-bevel',
                    isWhite: 'white-burn',
                    isBloom1: 'spotlight',
                    isBloom2: 'pink',
                  }[feature] || feature;

                  return <span className={"feature"} title={featureChance ? `${(featureChance * 100).toFixed(0)}%` : null}>
                    {featureName}
                  </span>
                })
              }
            </span> : null}
          </div>
        </div>
      })}
    </div>
  </div>
}


export function formatLength(seconds: number) {
  if (seconds < 90) {
    return `${seconds}s`;
  }
  else {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    if (minutes < 90) {
      return `${minutes}m ${seconds}s`
    }
    else {
      let hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      return `${hours}h ${minutes}m ${seconds}s`
    }
  }
}


export function generateFeatures(seed: number, numHearts: number) {
  // the rng
  function rnd() {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;

    return (((seed < 0) ? ~seed + 1 : seed) % 1000) / 1000;
  }

  // run in the same order has the script
  const bloom = rnd();
  const isBloom2 = bloom < 0.03;
  const isBloom1 = !isBloom2 && bloom < 0.06;
  const isMatte = rnd() < 0.4;
  const isThin = rnd() < 0.30;
  const isRough = rnd() < 0.15;
  const isWhite = (rnd() < 0.15) && !bloom;
  const fixedRotation = rnd() < 0.08;
  if (fixedRotation) {
    rnd(); rnd(); rnd();
  }

  let useCircle = rnd() < 0.5;
  let shift45Degrees = rnd() < 0.5;
  let itemInCenter = rnd() < 0.7;
  let reverseRowsCols = rnd() < 0.5;

  const props = {
    isBloom1,
    isBloom2,
    isMatte,
    isThin,
    isRough,
    isWhite,
    fixedRotation,

    // Some of them only take effect in certain cases
    // Here also it is the reverse that is rare
    noCenterItem: !itemInCenter && (useCircle && numHearts < 9 && numHearts >= 6),

    // Only the probabilities != 0.5 are interesting.
    // reverseRowsCols,
    // shift45Degrees,
    // useCircle
  };

  return Array.from(Object.entries(props)).filter(([name, isSet]) => {
    return isSet;
  }).map(([name]) => name);
}