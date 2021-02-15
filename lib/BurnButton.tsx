/** @jsxRuntime classic /
 /** @jsx jsx */
import { css, jsx } from '@emotion/react'
import {useState, Fragment} from "react";
import {useWeb3React} from "./web3wallet/core";
import {useRouter} from "next/router";
import {ConnectModal, getImperativeModal} from "./ConnectModal";
import {useContract} from "./useContract";


export function BurnButton(props: {children: any, tokenId: string}) {
  const [busy, setBusy] = useState(false);
  const { library, active } = useWeb3React();
  const router = useRouter();
  const contract = useContract();

  const doBurn = async () => {
    const withSigner = contract.connect(library.getSigner());

    let tx;

    try {
      tx = await withSigner.burn(props.tokenId)
    } catch(e) {
      console.log(e);
      return;
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch(e) {
      console.error(e);
      alert("Transaction failed.")
      return;
    }

    window.location.reload();
  }

  const [askToConnect, modalProps] = getImperativeModal();

  const handleClick = async () => {
    setBusy(true)
    try {
      if (active) {
        await doBurn();
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
        border: 0;
        margin-left: 15px;
        background: #333333;
        color: white;
        padding: 0.4em;
        border-radius: 0.1em;
      `}
    >
      {busy ? "Burning..." : props.children}
    </button>
  </Fragment>
}