import { toEth } from "./utils_fe";

const ethers = require("ethers");

const getRateInfo = async (
  fixedInput,
  inputTokenContract,
  outputTokenContract,
  amount,
  dexContracts,
  dexie
) => {
  const path = [inputTokenContract.target, outputTokenContract.target];

  let amountIn = fixedInput ? amount : 0;
  let amountOut = fixedInput ? 0 : amount;

  const rates = await Promise.all(
    dexContracts.map(async (dex) => {
      if (fixedInput) {
        amountOut = (
          await dexie.getAmountsOut(dex.router.target, amountIn, path)
        )[1];
      } else {
        amountIn = (
          await dexie.getAmountsIn(dex.router.target, amountOut, path)
        )[0];
      }
      return {
        name: dex.name,
        routerContract: dex.router,
        amountIn: toEth(amountIn, await inputTokenContract.decimals()),
        amountOut: toEth(amountOut, await outputTokenContract.decimals()),
        amountInWei: amountIn,
        amountOutWei: amountOut,
        rate: Number(amountOut) / Number(amountIn),
      };
    })
  );
  return rates;
};

export const getRateInfoFixedInput = async (...args) => {
  return await getRateInfo(true, ...args);
};

export const getRateInfoFixedOutput = async (...args) => {
  return await getRateInfo(false, ...args);
};

export const getBestRateFromRateInfo = (rateInfo) => {
  const sortedRateInfo = rateInfo.sort((a, b) => b.rate - a.rate);
  return sortedRateInfo[0];
};

export const fullSelectedPair = (selectedPair) => {
  return selectedPair && selectedPair.pairAddress;
};
