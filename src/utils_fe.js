import { ethers } from "ethers";

/**** Type Conversion functions ****/

const toEth = (wei, decimals = 18) => {
  return ethers.formatUnits(wei, decimals);
};

const tokens = (n, decimals = 18) => {
  return ethers.parseUnits(n.toString(), decimals);
};

const ether = tokens;

const fixNum = (number, numDecimals) => {
  numDecimals = Number(numDecimals);
  number = Number(number);
  const mulFac = 10 ** numDecimals;
  return (Math.round(parseFloat(number) * mulFac) / mulFac).toFixed(
    numDecimals
  );
};

export { toEth, tokens, ether, fixNum };
