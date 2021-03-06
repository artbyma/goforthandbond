/** @jsxRuntime classic /
 /** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {useState, Fragment} from "react";
import {useWeb3React} from "./web3wallet/core";
import {useRouter} from "next/router";
import {ConnectModal, getImperativeModal} from "./ConnectModal";
import {useContract} from "./useContract";


export function PurchaseButton() {
  const [busy, setBusy] = useState(false);
  const { library, active } = useWeb3React();
  const router = useRouter();
  const contract = useContract();

  const doPurchase = async () => {
    const withSigner = contract.connect(library.getSigner());

    const price = await contract.getCurrentPriceToMint();
    let tx;

    //let buffer = "20000000000000000";
    let buffer = 0;
    try {
      tx = await withSigner.mint({
        value: price.add(buffer)
      })
    } catch(e) {
      console.log(e);
      return;
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch(e) {
      console.error(e);
      alert("Purchase failed.")
      return;
    }

    window.location.reload();
  }

  const [askToConnect, modalProps] = getImperativeModal();

  const handleClick = async () => {
    setBusy(true)
    try {
      if (active) {
        await doPurchase();
      } else {
        // @ts-ignore
        if (await askToConnect()) {
          //await doPurchase();
        }
      }
    }
    finally {
      setBusy(false)
    }
  }

  return <Fragment>
    {/* @ts-ignore*/}
    <ConnectModal {...modalProps} />
    <button
        disabled={busy}
        onClick={handleClick}
        css={css`
       width: 80%;
       background-color: #363634;
       color: white;
       border: 0;
       padding: 0.7em;
       border-radius: 2px;
       font-size: 18px;
      `}
    >
      {active ? "Mint" : "Connect"}
      {busy ? "..." : null}
    </button>
  </Fragment>
}