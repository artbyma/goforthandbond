/** @jsxRuntime classic /
 /** @jsx jsx */

import {css, jsx} from "@emotion/react";
import Head from "next/head";

export default function Layout(props: {
  children: any
}) {
  return <div css={css`
    max-width: 1000px;
    margin: 0 auto;

    font-family: 'Spartan', sans-serif;
    font-size: 16px;
    line-height: 1.6;
  `}
  >
    <Head>
      <title>Love on a Curve</title>
      {process.browser && <script defer async data-domain="goforthandbond.by-ma.art" src="https://plausible.io/js/plausible.js" />}
    </Head>
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
      margin-top: 0;
      margin-bottom: 0.2em;
    `}>
      Love on a Curve
    </h1>
    <p style={{marginTop: '0em', lineHeight: '1.9'}}>
      <span css={css`
        background: #da3b42;
        padding: 0.4em 0.4em 0.3em;
        color: white;
        font-weight: bold;
      `}>
        Generative, Dynamic, Collectively-Experienced Artworks.
      </span>

      {" "} These NFTs are bought and sold on a bonding curve, and change for all owners to reflect
      the transactions of others on the curve. While you have no control over how your own piece looks,
      you can change artworks owned by others - but only by burning your own.
    </p>

    {props.children}
  </div>
}
