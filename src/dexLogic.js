import { toEth } from "./utils_fe";
import { DexieError } from "./errors";

const processError = (error, dispatch) => {
  // Processes error messages from smart contract calls and creates
  // a human-understandable message to be shown to the user
  let msg;
  if (error.reason === "ds-math-sub-underflow") {
    // Probably the amount is too large
    msg = "Amount too large";
  } else {
    msg = `Unknown error: ${error}`;
  }
  throw new DexieError(msg);
};

export const getRateInfo = async (
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
  let storedError = {};
  const rates = await Promise.all(
    dexContracts.map(async (dex) => {
      if (fixedInput) {
        try {
          amountOut = (
            await dexie.getAmountsOut(dex.router.target, amountIn, path)
          )[1];
        } catch (error) {
          storedError[dex.name] = error;
          return;
        }
      } else {
        try {
          amountIn = (
            await dexie.getAmountsIn(dex.router.target, amountOut, path)
          )[0];
        } catch (error) {
          storedError[dex.name] = error;
          return;
        }
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

  // If there were errors to the point where there is no available rate,
  // show the first one to the user
  if (rates.every((item) => item === undefined) && storedError) {
    processError(Object.values(storedError)[0]);
    for (const dex of Object.keys(storedError)) {
      console.log(`Error fetching pair in ${dex}: ${storedError[dex]}`);
    }
    return;
  }
  const validRates = rates.filter((rate) => rate != null);
  return validRates;
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
