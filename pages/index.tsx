/** @jsxRuntime classic /
/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Fragment, useCallback, useState } from 'react';
import {useAsyncValue} from "../lib/useAsyncValue";
import {formatEther} from "ethers/lib/utils";
import {PurchaseButton} from "../lib/PurchaseButton";
import {useWeb3React} from "../lib/web3wallet/core";
import {useContract} from "../lib/useContract";
import {BurnButton} from "../lib/BurnButton";
import Layout from "../lib/Layout";
import Link from "next/link";
import {DynamicImage} from "../lib/DynamicImage";


export default function HomePage() {
  return  <Layout>
    <div>
      <Link href={"/gallery"}>
        <a
          css={css`
            border: 0;
            margin: 10px 0;
            margin-right: 20px;
            background: #3f51b5;
            color: white;
            cursor: pointer;
            padding: 0.7em;
            text-decoration: none;
            border-radius: 0.1em;
            display: inline-block;
          `}
        >
          Gallery
        </a>
      </Link>
      <a
          href={"https://opensea.io/collection/love-on-a-curve"}
          css={css`
        border: 0;
        margin: 10px 0;
        background: #333333;
        color: white;
        padding: 0.7em;
        text-decoration: none;
        border-radius: 0.1em;
        display: inline-block;
      `}
      >
        Browse on OpenSea
      </a>
    </div>
    <div css={css`
      display: flex;
      flex-direction: row;
      margin: 40px 0;
      
      > div{
        flex: 1;
      }
      
      strong {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: normal;
        border-bottom: 1px solid black;
      }
    `}>
      <div>
        <strong>
          Current Piece
        </strong>
        <iframe src={`/api/hearts/live/current?size=600`} css={css`
          border: 0;
          width: 600px;
          height: 600px;
        `} />
      </div>
      <div css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      `}>
        <div style={{marginBottom: '40px'}} css={css`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          
          > div {
            margin: 20px;
          }
        `}>
          <Stats />
        </div>
        <PurchaseButton />
      </div>
    </div>

    <YourEditions />

    <div css={css`
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      flex-wrap: wrap;
      
      > div {
        border-top: 0.3px dotted black;
        padding-top: 0.5em;
        max-width: 45%;
      }
      strong {
        margin-bottom: 10px;
        font-size: 16px;
      }
`   }>
      <div>
        <strong>Bonding Curve?</strong>
        <p>
          The contract sells new editions at a fixed price formula. As more tokens
          are being sold, the price goes up.
        </p>
        <p>
          The contract also allows anyone to sell their editions back to the contract
          at whatever the current price is (minus a 5% fee going to the artist), thereby burning it.
          As the circulating supply decreases, the price goes down.
        </p>
        <p>
          Whenever an edition is burned, the artwork changes for all remaining owners.
        </p>
      </div>
      <div>
        <strong>Multiple Pieces</strong>
        <p>
          Each <em>piece</em> has a maximum of 9 <em>editions</em>, that is, ownable
          tokens associated with it. A new piece is created when the maximum editions of
          a piece have been minted, or after an elastic time limit has elapsed.
        </p>
        <p>
          As collectors sell their back to the curve, each piece embarks on a life of
          their own, changing in the process.
        </p>
        <p>
          Additionally, various rarity attributes exist.
        </p>
      </div>
      <div>
        <strong>Future Plans</strong>
        <p>
          This is intended to be the first art work in a series exploring this and similar
          mechanisms.
        </p>
      </div>
      <div>
        <strong>On-Chain</strong>
        <p>
          The attributes for each piece are stored on-chain. The code to generate the art work
          is currently *not* yet stored on-chain, but that will happen - there is a slot for it
          in the contract. It will thus always be possible to generate each piece. Beyond that,
          the metadata standard of ERC721 is used with an off-chain renderer run by us as a convenience
          so that OpenSea and other platforms have an easy way to display the pieces.
        </p>
      </div>
    </div>
    <div>
      <a href={"https://etherscan.io/address/0x75Dde2c445a112D270d766697330bE0Db700636E"}>Etherscan</a>
      {" "}&bull;{" "}
      <a href={"https://github.com/artbyma/goforthandbond"}>Github</a>
    </div>
  </Layout>;
}


function YourEditions() {
  const { library, active, account } = useWeb3React();
  const contract = useContract();

  const [items, {loading}] = useAsyncValue(async () => {
    if (!contract) { return []; }
    let result: {tokenId: string, piece: any, editionId: number}[] = [];
    const balance = await contract.balanceOf(account);
    for (let i=0; i<balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(account, i);
      const piece = await contract.getPieceForToken(tokenId);
      const editionId = piece.tokenIds.map(t => t.toNumber()).indexOf(tokenId.toNumber()) + 1;
      result.push({tokenId, piece, editionId});
    }
    return result;
  }, [active, library])

  const [burnPrice] = useAsyncValue(async () => {
    if (!contract) { return; }
    return await contract.getCurrentPriceToBurn();
  }, [active, library])

  if (!active || loading || !items.length) {
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
    <strong>
      Your Editions <small>(NB: It takes about 10 mins for them to update)</small>
    </strong>

    <div className={"grid"}>
      {items.map(item => {
        return <div className={"item"}>
          <a href={`/api/hearts/live/${item.piece.pieceNumber}`}>
            <DynamicImage url={`/api/hearts/image/${item.piece.pieceNumber}`} />
          </a>
          <span>
            Piece #{item.piece.pieceNumber.toString()}, Edition {item.editionId}
            <BurnButton tokenId={item.tokenId}>Burn for Ξ {parseFloat(formatEther(burnPrice)).toFixed(3)}</BurnButton>
        </span>
        </div>
      })}
    </div>
  </div>
}


function Stats(props: any) {
  const [value, {loading}] = useAsyncValue(() => fetch('/api/hearts/data').then(x => x.json()));

  return <Fragment>
    <div>
      <strong>Current Supply</strong>
      <div style={{fontSize: '24px', fontWeight: 'bold'}}>
        {loading ? '...' : value.totalSupply}
      </div>
    </div>
    <div>
      <strong># Unique Pieces</strong>
      <div style={{fontSize: '24px', fontWeight: 'bold'}}>
        {loading ? '...' : value.numPieces}
      </div>
    </div>
    <div>
      <strong>Current Price</strong>
      <div style={{fontSize: '24px', fontWeight: 'bold'}}>
        Ξ {loading ? '...' : formatEther(value.mintPrice)}
      </div>
    </div>
  </Fragment>
}