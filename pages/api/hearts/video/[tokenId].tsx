export default async function handler(req, res) {
  const {query: { pieceId }} = req;
  res.redirect(`http://imgix.com/hearts/${pieceId}.png`);
}