import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";
import { tokens } from "../utils_fe";
import {
  selectFirstToken,
  selectMatchingSymbols,
  setPair,
} from "../store/interactions";
import { setMatchingSymbols } from "../store/reducers/markets";

function SwapInput({ isInput, placeholder }) {
  const [symbol, setSymbol] = React.useState("");
  const [balance, setBalance] = React.useState(0);
  const pairs = useSelector((state) => state.markets.pairs);
  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const selectedPair = useSelector((state) => state.markets.selectedPair);
  const address = useSelector((state) => state.provider.account);
  const prevSelectedSymbol = useSelector(
    (state) => state.markets.selectedSymbol
  );
  const dispatch = useDispatch();

  const loadBalance = async () => {
    const erc20Contract = tokenContracts[symbol];
    if (!erc20Contract) {
      return;
    }
    const tokenBalance = await erc20Contract.balanceOf(address);
    const decimals = await erc20Contract.decimals();
    const balance = tokens(tokenBalance, decimals);
    setBalance(balance);
  };

  React.useEffect(() => {
    // Load balance if a pair is selected
    if (address !== null && selectedPair !== null) {
      loadBalance();
    }
  }, [selectedPair, symbol]);

  const handleTokenSelect = async (selectedOption, field) => {
    console.log(`Selected ${selectedOption.value} for ${field}`);
    const val = selectedOption.value;
    setSymbol(val);
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
      const inputSymbol = prevSelectedSymbol;
      const outputSymbol = val;
      const chosenPair = pairs.filter(
        (pair) =>
          (pair.quote === inputSymbol && pair.base === outputSymbol) ||
          (pair.base === inputSymbol && pair.quote === outputSymbol)
      );
      if (chosenPair[0] === undefined) {
        console.warn(
          `Pair between ${inputSymbol} and ${outputSymbol} not found`
        );
      } else {
        console.log(`Matching pairs: ${chosenPair}`);
        await setPair(chosenPair[0], dispatch);
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
      <div className="text-right text-gray-500 text-sm">
        Balance: {address ? `${balance} ${symbol}` : `Connect wallet`}
      </div>
    </div>
  );
}

export default SwapInput;
