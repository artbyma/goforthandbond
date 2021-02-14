export async function getHeartPiece(contract, pieceId: number) {
  const piece = await contract.getPiece(pieceId);
  return convertPiece(piece);
}

export async function getHeartPieceByToken(contract, tokenId: number) {
  const piece = await contract.getPieceForToken(tokenId);
  return convertPiece(piece);
}

function convertPiece(piece: any) {
  return {
    pieceId: piece.pieceNumber.toNumber(),
    seed: piece.randomSeed.toNumber(),
    tokens: piece.states,
    ids: piece.tokenIds.map(id => id.toNumber())
  }
}