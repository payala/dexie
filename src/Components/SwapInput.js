import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";
import { toEth, fixNum } from "../utils_fe";
import {
  selectFirstToken,
  selectMatchingSymbols,
  setPair,
  setTokenContract,
} from "../store/interactions";
import Spinner from "./Spinner";

function SwapInput({
  isInput,
  placeholder,
  onInputChanged,
  valueOverride,
  isUpdating,
}) {
  const [balance, setBalance] = React.useState(0);
  const [input, setInput] = React.useState(0);
  const pairs = useSelector((state) => state.markets.pairs);
  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const selectedPair = useSelector((state) => state.markets.selectedPair);
  const address = useSelector((state) => state.provider.account);
  const balances = useSelector((state) => state.tokens.balances);
  const tokenData = useSelector((state) => state.tokens.tokenData);

  const prevSelectedSymbol = useSelector(
    (state) => state.markets.selectedSymbol
  );
  const dispatch = useDispatch();

  const thisSymbol = () => {
    if (!selectedPair) {
      return null;
    }
    return isInput ? selectedPair.base : selectedPair.quote;
  };

  const handleValueChanged = (e) => {
    setInput(e.target.value);

    try {
      onInputChanged(e.target.value);
    } catch {}
  };

  const loadBalance = async () => {
    const symbol = thisSymbol();
    const erc20Contract = tokenContracts[symbol];
    if (!erc20Contract) {
      console.warn("Token contract not loaded");
      return;
    }
    const tokenBalance = await erc20Contract.balanceOf(address);
    const decimals = await erc20Contract.decimals();
    const balance = toEth(tokenBalance, decimals);
    setBalance(balance);
  };

  React.useEffect(() => {
    // Load balance if a pair is selected
    if (address !== null) {
      loadBalance();
    }
  }, [selectedPair, tokenContracts, balances, address]);

  const handleTokenSelect = async (selectedOption, field) => {
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
      setTokenContract(val, pairs, tokenContracts, dispatch);
      selectMatchingSymbols(matchingSymbols, dispatch);
      setPair({ ...selectedPair, base: val }, tokenData, dispatch);
    } else {
      // Choose the pair that would allow swapping the selected tokens
      const inputSymbol = prevSelectedSymbol;
      const outputSymbol = val;
      const matchingPairs = pairs.filter(
        (pair) =>
          (pair.quote === inputSymbol && pair.base === outputSymbol) ||
          (pair.base === inputSymbol && pair.quote === outputSymbol)
      );

      console.log(`Matching pairs: ${matchingPairs}`);
      // It doesn't really matter which pair we choose, we are only using it to
      // access the token addresses later
      let chosenPair = { ...matchingPairs[0] };

      // Change the base and quote to reflect the chosen direction
      // base = input
      // quote = output
      chosenPair.base = inputSymbol;
      chosenPair.quote = outputSymbol;
      if (chosenPair === undefined) {
        console.warn(
          `Pair between ${inputSymbol} and ${outputSymbol} not found`
        );
      } else {
        await setPair(chosenPair, tokenData, dispatch);
      }
    }
  };

  return (
    <div className={isInput ? "mb-0" : "mb-4"}>
      <div className="flex">
        <input
          type="number"
          placeholder={placeholder}
          className="block w-3/4 p-2 border rounded-l-lg bg-gray-700 placeholder-gray-500"
          onChange={handleValueChanged}
          value={valueOverride == null ? input : valueOverride}
        />
        <SearchableDropdown
          placeholder="Token"
          onTokenSelect={(selectedOption) =>
            handleTokenSelect(selectedOption, "input")
          }
          onlyAvailablePairs={!isInput}
          value={thisSymbol()}
        />
      </div>
      <div className="text-right text-gray-500 text-sm">
        Balance:{" "}
        {address ? (
          thisSymbol() ? (
            isUpdating ? (
              <Spinner />
            ) : (
              `${fixNum(balance, 6)} ${thisSymbol()}`
            )
          ) : (
            `Choose Token`
          )
        ) : (
          `Connect wallet`
        )}
      </div>
    </div>
  );
}

export default SwapInput;
