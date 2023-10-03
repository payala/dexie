const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  tokens,
  toEth,
  toEthNum,
  setTokens,
  mineAndWaitBlocks,
} = require("../scripts/utils");
const erc20Build = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const erc20Abi = erc20Build.abi;

describe("Dexie", async function () {
  let dexie, tx, result;
  let accounts, owner, investor1;

  const uniswapV2Router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const sushiswapV2Router = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
  const weth_address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const usdt_address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const usdc_address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  let signer, weth, usdt, usdc;
  let inputToken, outputToken;
  let initialInputTokenBalance, initialOutputTokenBalance;
  let inputAmount;
  let expectedOutputAmount;
  let inputDecimals, outputDecimals;
  let relTol = 10n; // per thousands
  let inputTolerance, outputTolerance;

  beforeEach(async () => {
    const Dexie = await ethers.getContractFactory("Dexie");
    dexie = await Dexie.deploy();

    accounts = await ethers.getSigners();
    owner = accounts[0];
    investor1 = accounts[1];

    signer = await ethers.provider.getSigner();
    weth = await ethers.getContractAt(erc20Abi, weth_address, signer);
    usdt = await ethers.getContractAt(erc20Abi, usdt_address, signer);
    usdc = await ethers.getContractAt(erc20Abi, usdc_address, signer);
    //console.log(await ethers.provider.getBlockNumber());
    inputToken = weth;
    outputToken = usdt;
    inputDecimals = await inputToken.decimals();
    outputDecimals = await outputToken.decimals();
    inputAmount = tokens(10, inputDecimals);
    expectedOutputAmount = tokens(16826.0, outputDecimals);

    inputTolerance = (inputAmount * relTol) / 1000n;
    outputTolerance = (expectedOutputAmount * relTol) / 1000n;

    // Give some tokens to the investor to swap
    // console.log(
    //   `${await outputToken.symbol()} balance before ${await outputToken.balanceOf(
    //     investor1
    //   )}`
    // );
    // console.log(
    //   `${await inputToken.symbol()} balance before ${await inputToken.balanceOf(
    //     investor1
    //   )}`
    // );
    // console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);

    initialInputTokenBalance = tokens(100, inputDecimals);
    initialOutputTokenBalance = tokens(1000000, outputDecimals);
    await setTokens(
      investor1.address,
      inputToken.target,
      initialInputTokenBalance
    );
    await setTokens(
      investor1.address,
      outputToken.target,
      initialOutputTokenBalance
    );

    // console.log(
    //   `${await outputToken.symbol()} balance after ${await outputToken.balanceOf(
    //     investor1
    //   )}`
    // );
    // console.log(
    //   `${await inputToken.symbol()} balance after ${await inputToken.balanceOf(
    //     investor1
    //   )}`
    // );
    // console.log(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  });
  describe("Calculating prices", async () => {
    describe("Success", () => {
      it("calculates output amount for the given input token swap", async () => {
        expect(
          (
            await dexie.getAmountsOut(uniswapV2Router, inputAmount, [
              inputToken,
              outputToken,
            ])
          )[1]
        ).to.approximately(expectedOutputAmount, outputTolerance);
      });

      it("allows calculating in reverse too", async () => {
        expect(
          (
            await dexie.getAmountsOut(uniswapV2Router, expectedOutputAmount, [
              outputToken,
              inputToken,
            ])
          )[1]
        ).to.approximately(inputAmount, inputTolerance);
      });
    });
  });

  describe("Doing swaps", () => {
    beforeEach(async () => {
      inputToken.connect(investor1).approve(dexie, inputAmount);
    });
    describe("Swapping on uniswap", () => {
      describe("Success", () => {
        beforeEach(async () => {
          tx = await dexie
            .connect(investor1)
            .swapOnUniV2(
              uniswapV2Router,
              [inputToken, outputToken],
              inputAmount,
              0
            );
          result = await tx.wait();
        });

        it("takes the input tokens from the account", async () => {
          expect(await inputToken.balanceOf(investor1)).to.approximately(
            initialInputTokenBalance - inputAmount,
            inputTolerance
          );
        });

        it("deposits the output tokens to the account", async () => {
          expect(await outputToken.balanceOf(investor1)).to.approximately(
            initialOutputTokenBalance + expectedOutputAmount,
            outputTolerance
          );
        });
      });
    });
  });
});
