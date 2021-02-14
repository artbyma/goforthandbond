import '../styles/global.css';
// import { Web3Provider } from '@ethersproject/providers'
// import {Web3ReactProvider} from "../lib/web3wallet/core";
// import {useMemo} from "react";
// import {getConnectors} from "../lib/connectors";
//
//
// function getLibrary(provider, connector) {
//   return new Web3Provider(provider);
// }

function MyApp({ Component, pageProps }) {
  // const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_NETWORK);
  // const connectors = useMemo(() => {
  //   return getConnectors(CHAIN_ID);
  // },[])

  return <Component {...pageProps} />

  // return (
  //     <Web3ReactProvider getLibrary={getLibrary} connectors={connectors}>
  //       <Component {...pageProps} />
  //     </Web3ReactProvider>
  // )
}

export default MyApp
