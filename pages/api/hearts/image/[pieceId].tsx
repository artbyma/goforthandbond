export default function page(req, res) {
  const {query: { pieceId }} = req;
  res.redirect(`http://imgix.com/hearts/${pieceId}.png`);
}