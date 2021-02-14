export default async function handler(req, res) {
  const {query: { pieceId }} = req;
  res.redirect(`https://gobond.s3.eu-west-2.amazonaws.com/hearts/${pieceId}.mp4`);
}