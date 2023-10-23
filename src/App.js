import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fixNum, toEth, tokens } from "./utils_fe";
import logo from "./logo.svg";
import "./App.css";
import SwapDetails from "./Components/SwapDetails";
import SwapInput from "./Components/SwapInput";
import MessageBanner from "./Components/MessageBanner";
import {
  loadAccount,
  loadDexes,
  loadMarkets,
  loadNetwork,
  getProvider,
  loadDexie,
  storeBestRateDex,
  executeBestRateSwap,
  loadBalances,
  setPair,
} from "./store/interactions";
import Navbar from "./Components/Navbar";
import markets from "./store/reducers/markets";

import Dexie from "./abis/Dexie.json";
import {
  fullSelectedPair,
  getBestRateFromRateInfo,
  getRateInfoFixedInput,
  getRateInfoFixedOutput,
} from "./dexLogic";
import Title from "./Components/Title";
import SwapArrow from "./Components/SwapArrow";
import SlippageInfo from "./Components/SlippageInfo";
import RateInfo from "./Components/RateInfo";
import Spinner from "./Components/Spinner";

function App() {
  const [banner, setBanner] = React.useState({
    visible: false,
    message: "",
    type: "",
  });
  const [rateInfo, setRateInfo] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");
  const [outputValue, setOutputValue] = React.useState("");
  const [bestRate, setBestRate] = React.useState(null);
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const account = useSelector((state) => state.provider.account);
  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const selectedPair = useSelector((state) => state.markets.selectedPair);
  const dexie = useSelector((state) => state.dexie.contract);
  const bestRateAt = useSelector((state) => state.markets.bestRateAt);
  const slippage = useSelector((state) => state.dexie.slippage);

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    setIsUpdating(true);
    const provider = await getProvider();
    const chainId = await loadNetwork(provider, dispatch);
    console.log(chainId);

    // Reload the page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    // Fetch current account from Metamask when changed
    window.ethereum.on("accountsChanged", async () => {
      await loadAccount(dispatch);
    });

    // Initiate contracts
    await loadDexes(provider, chainId, dispatch);
    await loadMarkets(provider, dispatch);
    await loadDexie(provider, chainId, dispatch);
    setIsUpdating(false);
  };

  React.useEffect(() => {
    loadBlockchainData();
  }, []);

  const showInProgress = (msg, withTimeout = false) => {
    setBanner({
      visible: true,
      message: msg,
      type: "warning",
      withTimeout: withTimeout,
    });
  };

  const showError = (msg, withTimeout = false) => {
    setBanner({
      visible: true,
      message: msg,
      type: "error",
      withTimeout: withTimeout,
    });
  };

  const showSuccess = (msg, withTimeout = false) => {
    setBanner({
      visible: true,
      message: msg,
      type: "success",
      withTimeout: withTimeout,
    });
  };

  const closeBanner = () => {
    setBanner({ visible: false, message: "", type: "" });
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    showInProgress("Swap in progress");
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const inputContract = tokenContracts[selectedPair.base];
      const outputContract = tokenContracts[selectedPair.quote];
      const minOutputValue = bestRate.amountOut * (1 - slippage / 100);
      const result = await executeBestRateSwap(
        dexie,
        bestRateAt,
        dexContracts,
        inputContract,
        outputContract,
        inputValue,
        minOutputValue,
        signer
      );
      const tokens = Object.values(tokenContracts);
      loadBalances(tokens, account, dispatch);
      showSuccess("Swap completed successfully", true);
    } catch (error) {
      showError("Swap Failed", true);
    }
    setIsSwapping(false);
  };

  const calculateRate = async (fixedInput, value) => {
    if (!fullSelectedPair(selectedPair) || !value) {
      return;
    }
    const inputContract = tokenContracts[selectedPair.base];
    const outputContract = tokenContracts[selectedPair.quote];

    if (fixedInput) {
      const decimals = await inputContract.decimals();
      const inputVal = tokens(value, decimals);
      return getRateInfoFixedInput(
        inputContract,
        outputContract,
        inputVal,
        dexContracts,
        dexie
      );
    } else {
      const decimals = await outputContract.decimals();
      const outputVal = tokens(value, decimals);
      return getRateInfoFixedOutput(
        inputContract,
        outputContract,
        outputVal,
        dexContracts,
        dexie
      );
    }
  };

  const setOutputForInput = async (inputValue) => {
    const parsedVal = Number(inputValue);
    if (!fullSelectedPair(selectedPair)) {
      return;
    }
    setIsUpdating(true);
    if (!Number.isFinite(parsedVal) || parsedVal <= 0) {
      if (parsedVal < 0) {
        setInputValue(0);
      }
      // Do a sample calculation to update the RateInfo even if no
      // amounts are selected yet
      const rateInfo = await calculateRate(true, 1);
      const bestRate = getBestRateFromRateInfo(rateInfo);
      setBestRate(bestRate);
      storeBestRateDex(bestRate, dispatch);
      setIsUpdating(false);
      return;
    }
    const rateInfo = await calculateRate(true, parsedVal);
    const bestRate = getBestRateFromRateInfo(rateInfo);
    setOutputValue(bestRate.amountOut);
    storeBestRateDex(bestRate, dispatch);
    setBestRate(bestRate);
    setIsUpdating(false);
  };

  const setInputForOutput = async (outputValue) => {
    const parsedVal = Number(outputValue);
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
    setInputValue(bestRate.amountIn);
    storeBestRateDex(bestRate, dispatch);
    setBestRate(bestRate);
    setIsUpdating(false);
  };

  React.useEffect(() => {
    setOutputForInput(inputValue);
  }, [selectedPair]);

  const handleInputChanged = async (value) => {
    setInputValue(value);
    setOutputForInput(value);
  };

  const handleOutputChanged = async (value) => {
    setOutputValue(value);
    setInputForOutput(value);
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
      <div className="flex-row bg-gray-900">
        <Navbar />
        <div>
          {banner.visible && (
            <MessageBanner
              message={banner.message}
              type={banner.type}
              onClose={closeBanner}
              withTimeout={banner.withTimeout}
            />
          )}
        </div>
        <div className="text-white flex items-center justify-center min-h-screen">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <Title />
            <SwapInput
              isInput={true}
              placeholder="Input Amount"
              valueOverride={inputValue}
              onInputChanged={handleInputChanged}
              isUpdating={isUpdating}
            />
            <SwapArrow onClick={swapTokens} />
            <SwapInput
              isInput={false}
              placeholder="Output Amount"
              valueOverride={fixNum(outputValue, 10)}
              onInputChanged={handleOutputChanged}
              isUpdating={isUpdating}
            />
            <SlippageInfo />
            <RateInfo>
              {bestRate
                ? [
                    `Rate:`,
                    <br />,
                    `1 ${selectedPair.base} = `,
                    isUpdating ? <Spinner /> : fixNum(bestRate.rate, 6),
                    ` ${selectedPair.quote}`,
                    <br />,
                    `(Best rate at ${bestRateAt})`,
                  ]
                : `Select two tokens to see the rate`}
            </RateInfo>
            <button
              onClick={handleSwap}
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg p-2 text-white"
              disabled={isSwapping}
            >
              {isSwapping ? <Spinner /> : "Swap"}
            </button>
          </div>
          <SwapDetails />
        </div>
      </div>
    </>
  );
}

export default App;
