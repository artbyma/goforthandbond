import {getContract} from "../../../lib/getContractServer";

export default async function handler(req, res) {
  const contract = getContract();
  const [mintPrice, burnPrice, numPieces, totalSupply] = await Promise.all([
      contract.getCurrentPriceToMint(),
      contract.getCurrentPriceToBurn(),
      contract.numPieces(),
      contract.totalSupply(),
  ]);

  const stats = {
    mintPrice: mintPrice.toString(),
    burnPrice: burnPrice.toString(),
    numPieces: numPieces.toNumber(),
    totalSupply: totalSupply.toNumber()
  };

  res.end(JSON.stringify(stats));
}