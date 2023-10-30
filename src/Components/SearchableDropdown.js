import React from "react";
import { useSelector } from "react-redux";
import Select, { createFilter } from "react-select";

const DropdownIndicator = () => null;

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
    height: "100%",
    minHeight: "2rem", // Ensure a minimum height to match the text input
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "100%",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: "0",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: "0",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px", // to ensure display of "WETH"
  }),
  singleValue: (provided) => ({
    ...provided,
    margin: "0", // to ensure display of "WETH"
  }),
};

function SearchableDropdown({
  placeholder,
  onlyAvailablePairs,
  onTokenSelect,
  value,
}) {
  const symbols = useSelector((state) => state.markets.symbols);
  const matchingSymbols = useSelector((state) => state.dexie.matchingSymbols);
  const [filteredOptions, setFilteredOptions] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (inputValue.length >= 1 || onlyAvailablePairs) {
      // Choose from all the tokens in the tokens list by default
      let symbolsBase = symbols;
      if (onlyAvailablePairs) {
        // Choose only tokens that exist in a pair with the previously selected token
        symbolsBase = matchingSymbols;
      }

      const filtered = symbolsBase
        .filter((token) =>
          token.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((token) => ({ value: token, label: token }));

      // It makes no sense to display more than 800 items, the search needs to be narrowed
      // down by typing
      filtered.length = Math.min(filtered.length, 800);
      setFilteredOptions(filtered);
    } else {
      // Initially start with some common tokens
      setFilteredOptions(
        [
          "WETH",
          "DAI",
          "USDC",
          "ETH",
          "USDT",
          "COMP",
          "BNB",
          "TRON",
          "MATIC",
          "LINK",
        ].map((v) => ({ value: v, label: v }))
      );
    }
  }, [inputValue, symbols, matchingSymbols, onlyAvailablePairs]);

  return (
    <Select
      options={filteredOptions}
      filterOption={createFilter({ ignoreAccents: false })} // Speed up while typing
      onInputChange={setInputValue}
      placeholder={placeholder}
      onChange={onTokenSelect}
      className="text-black w-1/4"
      styles={customStyles}
      components={{ DropdownIndicator }}
      value={value ? { value: value, label: value } : undefined}
    />
  );
}

export default SearchableDropdown;
