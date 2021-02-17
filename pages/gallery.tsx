/** @jsxRuntime classic /
 /** @jsx jsx */
import { css, jsx } from '@emotion/react'
import Layout from "../lib/Layout";
import {useAsyncValue} from "../lib/useAsyncValue";
import {DynamicImage} from "../lib/DynamicImage";

export default function Gallery() {
  return <Layout>
    <GalleryView />
  </Layout>
}


function GalleryView() {
  const [pieces, {loading}] = useAsyncValue(async () => {
    const response = await fetch("/api/hearts/pieces")
    return await response.json();
  }, [])

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
    
    .item span {
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
   
  `}
  >
    <h3>Gallery</h3>
    <div className={"grid"}>
      {pieces.map(item => {
        return <div className={"item"}>
          <a href={`/api/hearts/live/${item.number}`}>
            <DynamicImage url={`/api/hearts/image/${item.number}`} />
          </a>
          <span style={{fontSize: '12px'}}>
            #{item.number} <a href={`/api/hearts/live/${item.number}`}>live</a>
        </span>
        </div>
      })}
    </div>
  </div>
}
