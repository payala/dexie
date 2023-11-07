import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fixNum, tokens } from "./utils_fe";
import "./App.css";
import SwapDetails from "./Components/SwapDetails";
import MessageBanner from "./Components/MessageBanner";
import {
  loadAccount,
  loadDexes,
  loadMarkets,
  loadNetwork,
  getProvider,
  loadDexie,
  executeBestRateSwap,
  loadBalances,
} from "./store/interactions";
import Navbar from "./Components/Navbar";

import Title from "./Components/Title";
import SlippageInfo from "./Components/SlippageInfo";
import RateInfo from "./Components/RateInfo";
import Spinner from "./Components/Spinner";
import { clearError } from "./store/reducers/errors";
import NetworkModal from "./Components/NetworkModal";
import config from "./config.json";
import SwapData from "./Components/SwapData";

const chainsToRemove = [5];
const supportedChains = Object.keys(config)
  .map((dec) => Number(dec))
  .filter((id) => !chainsToRemove.includes(id));

function App() {
  const [banner, setBanner] = React.useState({
    visible: false,
    message: "",
    type: "",
  });

  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [networkSupported, setNetworkSupported] = React.useState(false);

  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const account = useSelector((state) => state.provider.account);
  const tokenContracts = useSelector((state) => state.tokens.contracts);
  const dexie = useSelector((state) => state.dexie.contract);
  const bestRate = useSelector((state) => state.dexie.bestRate);
  const slippage = useSelector((state) => state.dexie.slippage);
  const error = useSelector((state) => state.errors.message);
  const swapData = useSelector((state) => state.dexie.swapData);
  const pairs = useSelector((state) => state.markets.pairs);

  const dispatch = useDispatch();

  const loadBlockchainData = React.useCallback(async () => {
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

    if (!supportedChains.includes(Number(chainId))) {
      return;
    }

    setNetworkSupported(true);
    // Initiate contracts
    await loadDexes(provider, chainId, dispatch);
    await loadMarkets(provider, dispatch);
    await loadDexie(provider, chainId, dispatch);
    setIsUpdating(false);
  }, [dispatch]);

  React.useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]);

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

  React.useEffect(() => {
    if (error) {
      showError(error, true);
      dispatch(clearError());
    }
  }, [banner.message, banner.visible, dispatch, error]);

  const handleSwap = async () => {
    setIsSwapping(true);
    showInProgress("Swap in progress");
    if (!swapData.complete) {
      console.warn("Swap data not complete");
      showError("Swap Data not complete");
      setIsSwapping(false);
      return;
    }
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const inputContract = tokenContracts[swapData.inputToken];
      const outputContract = tokenContracts[swapData.outputToken];
      const minOutputValue = bestRate.amountOut * (1 - slippage / 100);
      await executeBestRateSwap(
        dexie,
        bestRate.name,
        dexContracts,
        inputContract,
        outputContract,
        swapData.inputAmount,
        minOutputValue,
        signer
      );
      const tokens = [swapData.inputToken, swapData.outputToken];
      loadBalances(tokens, tokenContracts, pairs, account, dispatch);
      showSuccess("Swap completed successfully", true);
    } catch (error) {
      showError("Swap Failed", true);
    }
    setIsSwapping(false);
  };

  return (
    <>
      <div className="flex flex-col bg-gray-900 min-h-screen">
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
        <div
          className="text-white flex flex-col grow items-center justify-center"
          // style={{ flexGrow: "1" }}
        >
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <Title />
            <SwapData isUpdating={isUpdating} setIsUpdating={setIsUpdating} />
            <SlippageInfo />
            <RateInfo>
              {bestRate ? (
                <>
                  Rate:
                  <br />
                  {`1 ${swapData.inputToken} = `}
                  {isUpdating ? <Spinner /> : fixNum(bestRate.rate, 6)}
                  {` ${swapData.outputToken}`}
                  <br />
                  {`(Best rate at ${bestRate.name})`}
                </>
              ) : (
                `Select two tokens to see the rate`
              )}
            </RateInfo>
            <button
              onClick={handleSwap}
              className="w-full bg-blue-500 disabled:bg-gray-500 hover:bg-blue-600 rounded-lg p-2 text-white"
              disabled={isSwapping || !swapData.complete}
            >
              {isSwapping ? <Spinner /> : "Swap"}
            </button>
          </div>
          {/* <SwapDetails /> */}
          <NetworkModal isOpen={!networkSupported} />
        </div>
      </div>
    </>
  );
}

export default App;
