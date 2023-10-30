import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { fixNum, tokens } from "../utils_fe";
import {
  fullSelectedPair,
  getBestRateFromRateInfo,
  getRateInfo,
} from "../dexLogic";
import { storeBestRate, setPair } from "../store/interactions";
import { callAndShowErrors } from "../errors";

import SwapInput from "./SwapInput";
import SwapArrow from "./SwapArrow";

function SwapData({ isUpdating, setIsUpdating }) {
  const [inputValue, setInputValue] = React.useState("");
  const [outputValue, setOutputValue] = React.useState("");

  const account = useSelector((state) => state.provider.account);
  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const selectedPair = useSelector((state) => state.markets.selectedPair);
  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const dexie = useSelector((state) => state.dexie.contract);

  const dispatch = useDispatch();

  const calculateRate = React.useCallback(
    async (fixedInput, value) => {
      if (!fullSelectedPair(selectedPair) || !value) {
        return;
      }
      const inputContract = tokenContracts[selectedPair.base];
      const outputContract = tokenContracts[selectedPair.quote];
      const setValue = tokens(value, decimals);
      let decimals = await outputContract.decimals();
      if (fixedInput) {
        decimals = await inputContract.decimals();
      }
      return getRateInfo(
        fixedInput,
        inputContract,
        outputContract,
        setValue,
        dexContracts,
        dexie
      );
    },
    [dexContracts, dexie, selectedPair, tokenContracts]
  );

  const setOutputForInput = async (inputValue) => {
    let invalidInput = false;
    const parsedVal = Number(inputValue);
    if (!fullSelectedPair(selectedPair)) {
      return;
    }
    setIsUpdating(true);
    if (!Number.isFinite(parsedVal) || parsedVal <= 0) {
      if (parsedVal < 0) {
        setInputValue(0);
      }
      invalidInput = true;
    }
    // If the input is invalid, do a sample calculation to update the RateInfo
    // even if no amounts are selected yet
    const rateInfo = await calculateRate(true, invalidInput ? 1 : parsedVal);
    const bestRate = getBestRateFromRateInfo(rateInfo);
    storeBestRate(bestRate);
    if (!invalidInput) {
      setOutputValue(fixNum(bestRate.amountOut, 8));
    }
    setIsUpdating(false);
  };

  const setInputForOutput = async (outputValue) => {
    const parsedVal = Number(outputValue);
    console.log(`Setting input for output ${outputValue}`);
    if (!Number.isFinite(parsedVal) || parsedVal <= 0) {
      setInputValue(0);
      if (parsedVal < 0) {
        setOutputValue(0);
      }
      return;
    }
    setIsUpdating(true);
    const rateInfo = await calculateRate(false, parsedVal);
    const bestRate = getBestRateFromRateInfo(rateInfo);
    setInputValue(fixNum(bestRate.amountIn, 8));
    storeBestRate(bestRate);
    setIsUpdating(false);
  };

  const handleInputChanged = async (value) => {
    setInputValue(value);
    callAndShowErrors(async () => await setOutputForInput(value), dispatch);
  };

  const handleOutputChanged = async (value) => {
    setOutputValue(value);
    callAndShowErrors(async () => await setInputForOutput(value), dispatch);
  };

  const swapTokens = () => {
    const newSelectedPair = {
      ...selectedPair,
      quote: selectedPair.base,
      base: selectedPair.quote,
    };
    setPair(newSelectedPair, dispatch);
  };

  return (
    <>
      <SwapInput
        isInput={true}
        placeholder="Input Amount"
        valueOverride={inputValue}
        onInputChanged={handleInputChanged}
      />
      <SwapArrow onClick={swapTokens} />
      <SwapInput
        isInput={false}
        placeholder="Output Amount"
        valueOverride={outputValue}
        onInputChanged={handleOutputChanged}
      />
    </>
  );
}

export default SwapData;
