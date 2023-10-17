// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { saveConfig, copyAbi, setTokens, tokens } = require("./utils");

const config = require("../src/config.json");

const erc20Build = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const erc20Abi = erc20Build.abi;

const weth_address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const usdt_address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const usdc_address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function main() {
  const Dexie = await hre.ethers.getContractFactory("Dexie");
  const dexie = await Dexie.deploy();

  const { chainId } = await hre.ethers.provider.getNetwork();

  console.log(`Dexie deployed to: ${dexie.target} on network ${chainId}`);
  if (chainId === 31337n) {
    const accounts = await hre.ethers.getSigners();
    const owner = accounts[0];
    const investor1 = accounts[1];
    const signer = await hre.ethers.provider.getSigner();
    const weth = await hre.ethers.getContractAt(erc20Abi, weth_address, signer);
    const usdt = await hre.ethers.getContractAt(erc20Abi, usdt_address, signer);
    const usdc = await hre.ethers.getContractAt(erc20Abi, usdc_address, signer);
    console.log("Hardhat network detected, giving some tokens to swap");
    const wethBal = tokens(100, await weth.decimals());
    const usdtBal = tokens(1000000, await usdt.decimals());
    const usdcBal = tokens(2000000, await usdc.decimals());
    for (const [token, bal] of [
      [weth, wethBal],
      [usdc, usdcBal],
      [usdt, usdtBal],
    ]) {
      await setTokens(investor1.address, token.target, bal);
    }
    config[chainId].dexie.address = dexie.target;
    saveConfig(config, "../src/config.json");
    copyAbi("Dexie", "../artifacts");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
