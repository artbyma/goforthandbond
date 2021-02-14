import {getContract} from "../../../../lib/getContractServer";
import {getHeartPieceByToken} from "../../../../lib/getHeartPiece";
import {NextApiRequest} from "next";

export default async function handler(req: NextApiRequest, res) {
  const {query: { tokenId }} = req;

  const intTokenId = parseInt(tokenId as string);

  const contract = await getContract();
  const info = await getHeartPieceByToken(contract, intTokenId);

  const editionId = info.ids.indexOf(intTokenId) + 1;
  const pieceId = info.pieceId;

  res.end(JSON.stringify({
    "name": `Love on a Curve #${pieceId}, Edition ${editionId}`,
    "description": "A Generative, Dynamic, Collectively-Experienced Artwork.",
    "image": `/api/hearts/image/${pieceId}`,
    "animation_url": `/api/hearts/video/${pieceId}`,
    "attributes": [
      {
        "display_type": "number",
        "trait_type": "Piece",
        "value": pieceId
      },
      {
        "display_type": "number",
        "trait_type": "Edition",
        "value": editionId
      }
    ]
  }))
}
