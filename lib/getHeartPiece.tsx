export async function getHeartPiece(contract, pieceId: number) {
  const piece = await contract.getPiece(pieceId);

  return {
    seed: piece.randomSeed.toNumber(),
    tokens: piece.states,
  }
}