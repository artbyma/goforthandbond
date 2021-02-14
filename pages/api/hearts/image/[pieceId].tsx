export default function page(req, res) {
  const {query: { pieceId }} = req;
  res.redirect(`https://gobond.s3.eu-west-2.amazonaws.com/hearts/${pieceId}.png`);
}