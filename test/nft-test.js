const {BigNumber} = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { waffle, network } = require("hardhat");
const provider = waffle.provider;

export async function setupNFTContract() {
  const [deployer, user, creator] = await ethers.getSigners();
  const NFT = await ethers.getContractFactory("NFT", deployer);
  const nft = await NFT.deploy();
  await nft.deployed();
  await nft.setCreator(creator.address);
  return nft.connect(user);
}

describe("NFT", function() {
  let nft;
  beforeEach(async () => {
    nft = await setupNFTContract();
  });

  it("mints and burns", async function () {
    const [deployer, user, creator] = await ethers.getSigners();

    const creatorBalance = await provider.getBalance(creator.address);

    expect(await nft.getCurrentPriceToMint()).to.equal("5000000000000000");
    expect(await nft.getCurrentPriceToBurn()).to.equal("0");

    await nft.mint({value: await nft.getCurrentPriceToMint()});
    expect(await nft.getCurrentPriceToBurn()).to.equal("4750000000000000");
    expect(await nft.getCurrentPriceToMint()).to.equal("10000000000000000");
    expect(await provider.getBalance(creator.address)).to.equal(creatorBalance.add("250000000000000"));

    await nft.mint({value: await nft.getCurrentPriceToMint()});
    expect(await nft.getCurrentPriceToBurn()).to.equal("9500000000000000");
    expect(await nft.getCurrentPriceToMint()).to.equal("15000000000000000");
    expect(await provider.getBalance(creator.address)).to.equal(creatorBalance.add("750000000000000"));

    await nft.burn(1);
    expect(await nft.getCurrentPriceToBurn()).to.equal("4750000000000000");
    expect(await nft.getCurrentPriceToMint()).to.equal("10000000000000000");
    expect(await provider.getBalance(creator.address)).to.equal(creatorBalance.add("750000000000000"));
  });

  it("manages the new piece timespans", async function () {
    await nft.mint({value: await nft.getCurrentPriceToMint()});
    const firstPiece = await nft.getPiece(1);
    const firstPieceDuration = firstPiece.scheduledEndAt.sub(firstPiece.startedAt);

    // No new piece yet
    await network.provider.request({method: "evm_mine", params: [firstPiece.scheduledEndAt.sub(10).toNumber()]});
    await nft.mint({value: await nft.getCurrentPriceToMint()});
    expect(await nft.numPieces()).to.equal(1);

    // New piece
    await network.provider.request({method: "evm_mine", params: [firstPiece.scheduledEndAt.toNumber()]});
    await nft.mint({value: await nft.getCurrentPriceToMint()});
    expect(await nft.numPieces()).to.equal(2);

    // Duration has now increased
    const secondPiece = await nft.getPiece(2);
    const secondPieceDuration = secondPiece.scheduledEndAt.sub(secondPiece.startedAt);
    expect(secondPieceDuration.toNumber()).to.be.greaterThan(firstPieceDuration.toNumber());

    // Let's fill this piece
    for (let i=0; i<10; i++) {
      await nft.mint({value: await nft.getCurrentPriceToMint()});
    }
    expect(await nft.numPieces()).to.equal(3);

    // Duration has now decreased
    const thirdPiece = await nft.getPiece(3);
    const thirdPieceDuration = thirdPiece.scheduledEndAt.sub(thirdPiece.startedAt);
    expect(thirdPieceDuration.toNumber()).to.be.lessThan(secondPieceDuration.toNumber());
  });
});