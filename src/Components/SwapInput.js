import React from "react";
import { useSelector } from "react-redux";
import SearchableDropdown from "./SearchableDropdown";

function SwapInput({ isInput, placeholder }) {
  const handleTokenSelect = (selectedOption, field) => {
    console.log(`Selected ${selectedOption.value} for ${field}`);
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
        />
      </div>
      <div className="text-right text-gray-500 text-sm">Balance: 0.00 ETH</div>
    </div>
  );
}

export default SwapInput;
