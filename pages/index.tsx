/** @jsxRuntime classic /
/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import { Fragment } from 'react';
import {useAsyncValue} from "../lib/useAsyncValue";
import {formatEther} from "ethers/lib/utils";

function HomePage() {
  return  <div css={css`
    max-width: 1000px;
    margin: 0 auto;
    
    font-family: 'Spartan', sans-serif;
    font-size: 16px;
    line-height: 1.6;
  `}
  >
    <div css={css`
      text-align: right;
      margin-top: 30px;
      font-size: 14px;
    `}>
      <a href={"https://twitter.com/artbyma"}>a BYMA project</a>
    </div>
    <h1 css={css`
      font-family: 'Amatic SC', cursive;
      font-size: 55px;
      margin-top: 0em;
      margin-bottom: 0.2em;
    `}>
      Love on a Curve
    </h1>
    <p style={{marginTop: '0em'}}>
      <span css={css`
        background: #da3b42;
        padding: 0.4em 0.4em;
        color: white;
        font-weight: bold;
        line-height: 2;
      `}>
        Generative, Dynamic, Collectively-Experienced Artworks.
      </span>

      {" "} They are bought and sold on a bonding curve, and change for all owners to reflect
      the transactions of the curve.
    </p>
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
        <iframe src={`/api/hearts/live/1?size=600`} css={css`
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
        <Button>Connect Wallet</Button>
      </div>
    </div>
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
          at whatever the current price is (there is a 1% spread), thereby burning it.
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
  </div>;
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


function Button(props: {
  children: any
}) {
  return <button css={css`
    border: 0;
    background: #433c3c;
    color: white;
    padding: 0.4em 0.4em;
    font-size: 22px;
    border-radius: 2px;
  `}>
    {props.children}
  </button>
}

export default HomePage