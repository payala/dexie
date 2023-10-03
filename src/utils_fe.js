import { ethers } from "ethers";

/**** Type Conversion functions ****/

const toEth = (wei) => {
  return ethers.utils.formatUnits(wei, "ether");
};

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

const fixNum = (number, numDecimals) => {
  const mulFac = 10 ** numDecimals;
  return (Math.round(parseFloat(number) * mulFac) / mulFac).toFixed(
    numDecimals
  );
};

export { toEth, tokens, ether, fixNum };
