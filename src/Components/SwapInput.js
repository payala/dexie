import React from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";
import { toEth, fixNum } from "../utils_fe";
import Spinner from "./Spinner";

function SwapInput({
  isInput,
  placeholder,
  onAmountChanged,
  onTokenChanged,
  amount,
  symbol,
  matchingSymbols,
}) {
  const [balance, setBalance] = React.useState(0);
  const [isBalanceUpdating, setIsBalanceUpdating] = React.useState(false);

  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const address = useSelector((state) => state.provider.account);

  const dispatch = useDispatch();

  const handleAmountChanged = (e) => {
    onAmountChanged && onAmountChanged(e.target.value);
  };

  const loadBalance = React.useCallback(async () => {
    setIsBalanceUpdating(true);

    const erc20Contract = tokenContracts[symbol];
    if (!erc20Contract) {
      console.warn("Token contract not loaded");
      return;
    }
    const tokenBalance = await erc20Contract.balanceOf(address);
    const decimals = await erc20Contract.decimals();
    const balance = toEth(tokenBalance, decimals);
    setBalance(balance);
    setIsBalanceUpdating(false);
  }, [address, symbol, tokenContracts]);

  React.useEffect(() => {
    // Load balance if a pair is selected
    if (address !== null) {
      loadBalance();
    }
  }, [loadBalance, address]);

  const handleTokenSelect = async (selectedOption) => {
    const val = selectedOption.value;
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
              `${fixNum(balance, 6)} ${symbol}`
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
