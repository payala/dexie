import React from "react";
import { useDispatch, useSelector } from "react-redux";

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
  loadTokens,
} from "./store/interactions";
import Navbar from "./Components/Navbar";
import markets from "./store/reducers/markets";

function App() {
  const [banner, setBanner] = React.useState({
    visible: false,
    message: "",
    type: "",
  });
  const [rateInfo, setRateInfo] = React.useState([]);
  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const account = useSelector((state) => state.provider.account);
  const tokenContracts = useSelector((state) => state.markets.tokenContracts);
  const reversed = useSelector((state) => state.markets.reversed);
  const dexContracts = useSelector((state) => state.markets.dexContracts);
  const selectedPair = useSelector((state) => state.markets.selectedPair);
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
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
    // todo: await loadDexie
  };

  React.useEffect(() => {
    loadBlockchainData();
  }, []);

  React.useEffect(() => {
    const token0Contract = tokenContracts[selectedPair.base];
    const token1Contract = tokenContracts[selectedPair.quote];
    const rateInfo = getRateInfo(token0Contract, token1Contract, reversed);
  }, [selectedPair]);

  const showError = (msg) => {
    setBanner({ visible: true, message: msg, type: "error" });
  };

  const showSuccess = (msg) => {
    setBanner({
      visible: true,
      message: msg,
      type: "success",
    });
  };

  const closeBanner = () => {
    setBanner({ visible: false, message: "", type: "" });
  };

  const handleSwap = () => {};

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
            />
          )}
        </div>
        <div className="text-white flex items-center justify-center min-h-screen">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h1
              className="text-6xl font-bold mb-4 text-center"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Dexie
            </h1>
            <SwapInput isInput={true} placeholder="Input Amount" />
            {/* <!-- Swap Arrow --> */}
            <div className="text-center my-2 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 mx-auto mb-6 mt-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </div>

            {/* <!-- Output Field --> */}
            <SwapInput isInput={false} placeholder="Output Amount" />

            {/* <!-- Slippage Info --> */}
            <div className="bg-gray-700 p-4 rounded-lg mb-2">
              <div className="mb-2">Max Slippage</div>
              <div className="flex justify-between">
                <button className="px-4 py-1 rounded-full bg-gray-600 text-white">
                  0.5%
                </button>
                <button className="px-4 py-1 rounded-full bg-gray-600 text-white">
                  1%
                </button>
                <button className="px-4 py-1 rounded-full bg-gray-600 text-white">
                  2%
                </button>
              </div>
            </div>

            {/* <!-- Rate Info --> */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              Rate: 1 ETH = 2000 DAI (Best rate at Uniswap)
            </div>

            {/* <!-- Swap Button --> */}
            <button
              onClick={handleSwap}
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg p-2 text-white"
            >
              Swap
            </button>
          </div>
          <SwapDetails />
        </div>
      </div>
    </>
  );
}

export default App;
