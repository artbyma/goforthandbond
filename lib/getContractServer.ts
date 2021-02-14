// const provider = new ethers.providers.InfuraProvider(
//     'rinkeby', '134faaf6c8b64741b67fce6ae1683183');

import {ethers} from "ethers";
import {nftAbi} from "./useContract";

const provider = new ethers.providers.JsonRpcProvider(process.env.JSONRPC_URL);

export function getContract() {
  return new ethers.Contract(process.env.NEXT_PUBLIC_NFT_ADDRESS, nftAbi, provider);
}
