import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";
import { toEth, fixNum } from "../utils_fe";
import Spinner from "./Spinner";
import { loadBalances, setTokenContract } from "../store/interactions";
import { setBalances } from "../store/reducers/tokens";

function SwapInput({
  isInput,
  placeholder,
  onAmountChanged,
  onTokenChanged,
  amount,
  symbol,
  matchingSymbols,
}) {
  const [isBalanceUpdating, setIsBalanceUpdating] = React.useState(false);

  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const address = useSelector((state) => state.provider.account);
  const pairs = useSelector((state) => state.markets.pairs);
  const balances = useSelector((state) => state.tokens.balances);

  const dispatch = useDispatch();

  const handleAmountChanged = (e) => {
    onAmountChanged && onAmountChanged(e.target.value);
  };

  const handleTokenSelect = async (selectedOption) => {
    const val = selectedOption.value;
    await setTokenContract(val, pairs, tokenContracts, dispatch);
    setIsBalanceUpdating(true);
    loadBalances(
      [...Object.keys(balances), val],
      tokenContracts,
      pairs,
      address,
      dispatch
    );
    setIsBalanceUpdating(false);
    onTokenChanged && onTokenChanged(val);
  };

  return (
    <div className={isInput ? "mb-0" : "mb-4"}>
      <div className="flex">
        <input
          type="number"
          placeholder={!symbol ? "Select Token" : placeholder}
          disabled={!symbol}
          className="block w-3/4 p-2 border rounded-l-lg bg-gray-700 placeholder-gray-500"
          onChange={handleAmountChanged}
          value={amount}
        />
        <SearchableDropdown
          placeholder="Token"
          onTokenSelect={(selectedOption) =>
            handleTokenSelect(selectedOption, "input")
          }
          onlyMatchingSymbols={matchingSymbols && matchingSymbols.length > 0}
          value={symbol}
          matchingSymbols={matchingSymbols}
        />
      </div>
      <div className="text-right text-gray-500 text-sm">
        Balance:{" "}
        {address ? (
          symbol ? (
            isBalanceUpdating ? (
              <Spinner />
            ) : (
              `${fixNum(balances[symbol], 6)} ${symbol}`
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
