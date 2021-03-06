import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {formatEther} from "ethers/lib/utils";
import {BigNumber} from "ethers";

require('dotenv').config({path: '.env.local'});


task("deploy", "Deploy the contract", async (args, hre) => {
  let sourceCodeSubmitters: any[] = [];
  async function deployContract(name: string, args: any, opts: any) {
    console.log(`Deploying ${name}...`);
    const Class = await hre.ethers.getContractFactory(name);
    const contract = await Class.deploy(...args, opts);
    console.log('  ...[waiting to mine]')
    await contract.deployed();

    sourceCodeSubmitters.push(async () => {
      console.log(`  ...[${name}]`)
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: args
      });
    })

    return contract;
  }

  await hre.run('compile');

  const gasPrice = undefined; //BigNumber.from("100000000000");
  const nft = await deployContract('NFT', [], {gasPrice});
  console.log("ERC721 deployed to:", nft.address);

  // console.log("Making Curve the minter");
  // await (await nft.setMinter(curve.address)).wait();

  if (hre.network.name == "main" || hre.network.name == "rinkeby") {
    console.log("Waiting 5 confirmations for Etherscan before we submit the source code");
    await new Promise(resolve => {
      setTimeout(resolve, 60 * 1000);
    });
    for (const submitter of sourceCodeSubmitters) {
      try {
        await submitter();
      } catch (e) {
        console.log("Error submitting validation", e)
      }
    }
  }
});


task("set-uri", "Set the base url")
  .addParam("contract", "The NFT contract address")
  .addParam("uri", "The metadata base uri")
  .setAction(async (args, hre) =>
  {
    const contract = await getContract(hre, args.contract);
    const result = await (await contract.setBaseURI(args.uri || "https://goforthandbond.by-ma.art/api/hearts/metadata/")).wait();
  });


task("mint", "Mint a token")
    .addParam("contract", "The NFT contract address")
    .setAction(async (args, hre) =>
{
  const contract = await getContract(hre, args.contract);

  const price = await contract.getCurrentPriceToMint();
  console.log("Current price is: " + formatEther(price.toString()));

  const result = await (await contract.mint({value: price})).wait();
  console.log('Token ID: ', result.events[1].args.tokenId.toString());
  console.log('Reserve After Mint: ', formatEther(result.events[1].args.reserveAfterMint));
  console.log("New price is: " + formatEther((await contract.getCurrentPriceToMint()).toString()));
  console.log("Piece data: " + (await contract.getPiece(result.events[1].args.pieceId)));
});


task("burn", "Burn a token")
    .addParam("contract", "The NFT contract address")
    .addParam("token", "The token id to burn")
    .setAction(async (args, hre) =>
{
  const contract = await getContract(hre, args.contract);
  console.log("Current price is: " + formatEther((await contract.getCurrentPriceToMint()).toString()));
  const result = await (await contract.burn(args.token)).wait();

  console.log("New price is: " + formatEther((await contract.getCurrentPriceToMint()).toString()));
  console.log('Reserve After Burn: ', formatEther(result.events[2].args.reserveAfterBurn));
  console.log("Piece data: " + (await contract.getPieceForToken(args.token)));
});


export async function getContract(hre: HardhatRuntimeEnvironment, address: string) {
  const signers = await hre.ethers.getSigners();
  const Abi = (await hre.artifacts.readArtifact("NFT")).abi;
  return new hre.ethers.Contract(address, Abi, signers[0]);
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: "0.7.3",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_JSON_RPC_URL,
      accounts: {
        mnemonic: process.env.RINKEBY_MNEMONIC
      }
    },
    main: {
      url: process.env.MAIN_JSON_RPC_URL,
      accounts: {
        mnemonic: process.env.MAIN_MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
