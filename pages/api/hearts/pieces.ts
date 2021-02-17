import {getContract} from "../../../lib/getContractServer";

export default async function handler(req, res) {
  const contract = getContract();

  const numPieces = await contract.numPieces();

  const promises = [];
  for (let i=1; i<=numPieces; i++) {
    promises.push(contract.getPiece(i));
  }
  const all = await Promise.all(promises);
  const allFormatted = all.map(piece => {
    return {
      number: piece.pieceNumber.toNumber(),
      numOwners: piece.states.filter(isActive => isActive).length,
      numHearts: piece.states.length,
      length: piece.endedAt.sub(piece.startedAt).toNumber()
    };
  })

  res.end(JSON.stringify(allFormatted));
}