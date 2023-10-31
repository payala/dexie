import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { fixNum, tokens } from "../utils_fe";
import { getBestRateFromRateInfo, getRateInfo } from "../dexLogic";
import { callAndShowErrors } from "../errors";
import {
  storeBestRate,
  setTokenContract,
  findMatchingSymbols,
} from "../store/interactions";

import SwapInput from "./SwapInput";
import SwapArrow from "./SwapArrow";

function SwapData({ isUpdating, setIsUpdating, setInputValueUpstream }) {
  const [inputValue, setInputValueState] = React.useState("");
  const [outputValue, setOutputValue] = React.useState("");
  const [inputToken, setInputToken] = React.useState("");
  const [outputToken, setOutputToken] = React.useState("");
  const [inputMatchingSymbols, setInputMatchingSymbols] = React.useState([]);
  const [outputMatchingSymbols, setOutputMatchingSymbols] = React.useState([]);

  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const dexie = useSelector((state) => state.dexie.contract);
  const pairs = useSelector((state) => state.markets.pairs);
  const tokenData = useSelector((state) => state.tokens.tokenData);

  const dispatch = useDispatch();

  // TODO: REMOVE UPSTREAM
  const setInputValue = (value) => {
    setInputValueState(value);
    setInputValueUpstream(value);
  };

  const calculateRate = React.useCallback(
    async (fixedInput, value) => {
      if ((!inputToken && !outputToken) || !value) {
        return;
      }
      const inputContract = tokenContracts[inputToken];
      const outputContract = tokenContracts[outputToken];
      let decimals = await outputContract.decimals();
      if (fixedInput) {
        decimals = await inputContract.decimals();
      }
      const setValue = tokens(value, decimals);
      return getRateInfo(
        fixedInput,
        inputContract,
        outputContract,
        setValue,
        dexContracts,
        dexie
      );
    },
    [dexContracts, dexie, inputToken, outputToken, tokenContracts]
  );

  const onAmountChanged = async (newAmount, isInput) => {
    let invalidInput = false;
    const parsedVal = Number(newAmount);
    if (!Number.isFinite(parsedVal) || parsedVal <= 0) {
      if (parsedVal < 0) {
        isInput ? setInputValue(0) : setOutputValue(0);
      }
      invalidInput = true;
    }
    // If the input is invalid, do a sample calculation to update the RateInfo
    // even if no amounts are selected yet
    setIsUpdating(true);
    const rateInfo = await calculateRate(isInput, invalidInput ? 1 : parsedVal);
    const bestRate = getBestRateFromRateInfo(rateInfo);
    storeBestRate(bestRate, dispatch);
    if (!invalidInput) {
      isInput
        ? setOutputValue(fixNum(bestRate.amountOut, 8))
        : setInputValue(fixNum(bestRate.amountIn, 8));
    }
    setIsUpdating(false);
  };

  const setOutputForInput = async (inputValue) => {
    onAmountChanged(inputValue, true);
  };

  const setInputForOutput = async (outputValue) => {
    onAmountChanged(outputValue, false);
  };

  const handleInputChanged = async (value) => {
    setInputValue(value);
    callAndShowErrors(async () => await setOutputForInput(value), dispatch);
  };

  const handleOutputChanged = async (value) => {
    setOutputValue(value);
    callAndShowErrors(async () => await setInputForOutput(value), dispatch);
  };

  const handleInputTokenChanged = async (val) => {
    // Prepare the list of possible tokens for the output field
    setInputToken(val);
    setOutputMatchingSymbols(findMatchingSymbols(val, pairs));
    setTokenContract(val, pairs, tokenContracts, dispatch);
  };

  const handleOutputTokenChanged = async (val) => {
    // Choose the pair that would allow swapping the selected tokens
    setOutputToken(val);
    setInputMatchingSymbols(findMatchingSymbols(val, pairs));
    setTokenContract(val, pairs, tokenContracts, dispatch);
  };

  const swapTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputValue(outputValue);
    setOutputValue(inputValue);
  };

  return (
    <>
      <SwapInput
        isInput={true}
        placeholder="Input Amount"
        amount={inputValue}
        symbol={inputToken}
        onAmountChanged={handleInputChanged}
        onTokenChanged={handleInputTokenChanged}
        matchingSymbols={inputMatchingSymbols}
      />
      <SwapArrow onClick={swapTokens} />
      <SwapInput
        isInput={false}
        placeholder="Output Amount"
        amount={outputValue}
        symbol={outputToken}
        onAmountChanged={handleOutputChanged}
        onTokenChanged={handleOutputTokenChanged}
        matchingSymbols={outputMatchingSymbols}
      />
    </>
  );
}

export default SwapData;
