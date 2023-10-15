import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";
import {
  selectFirstToken,
  selectMatchingSymbols,
  setPair,
} from "../store/interactions";
import { setMatchingSymbols } from "../store/reducers/markets";

function SwapInput({ isInput, placeholder }) {
  const pairs = useSelector((state) => state.markets.pairs);
  const selectedSymbol = useSelector((state) => state.markets.selectedSymbol);
  const dispatch = useDispatch();
  const handleTokenSelect = (selectedOption, field) => {
    console.log(`Selected ${selectedOption.value} for ${field}`);
    const val = selectedOption.value;
    if (isInput) {
      // Prepare the list of possible tokens for the output field

      selectFirstToken(val, dispatch);
      const relevantPairs = pairs.filter(
        (pair) => pair.base === val || pair.quote === val
      );
      const matchingSymbols = relevantPairs.map((pair) =>
        pair.quote === val ? pair.base : pair.quote
      );
      selectMatchingSymbols(matchingSymbols, dispatch);
    } else {
      // Choose the pair that would allow swapping the selected tokens
      const inputSymbol = selectedSymbol;
      const outputSymbol = val;
      const chosenPair = pairs.filter(
        (pair) =>
          (pair.quote === inputSymbol && pair.base === outputSymbol) ||
          (pair.base === outputSymbol && pair.quote === inputSymbol)
      );
      if (chosenPair[0] === undefined) {
        console.warn(
          `Pair between ${inputSymbol} and ${outputSymbol} not found`
        );
      } else {
        console.log(`Matching pairs: ${chosenPair}`);
        setPair(chosenPair[0], dispatch);
      }
    }
  };

  return (
    <div className={isInput ? "mb-0" : "mb-4"}>
      <div className="flex">
        <input
          type="text"
          placeholder={placeholder}
          className="block w-3/4 p-2 border rounded-l-lg bg-gray-700 placeholder-gray-500"
        />
        <SearchableDropdown
          placeholder="Token"
          onTokenSelect={(selectedOption) =>
            handleTokenSelect(selectedOption, "input")
          }
          onlyAvailablePairs={!isInput}
        />
      </div>
      <div className="text-right text-gray-500 text-sm">Balance: 0.00 ETH</div>
    </div>
  );
}

export default SwapInput;
