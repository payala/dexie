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
      const amountInWei = amountIn;
      const amountOutWei = amountOut;
      const amountInNat = toEth(amountIn, await inputTokenContract.decimals());
      const amountOutNat = toEth(
        amountOut,
        await outputTokenContract.decimals()
      );
      const rate = Number(amountOutNat) / Number(amountInNat);
      return {
        name: dex.name,
        routerContract: dex.router,
        amountIn: amountInNat,
        amountOut: amountOutNat,
        amountInWei: amountInWei,
        amountOutWei: amountOutWei,
        rate: rate,
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
