import React from "react";

function NetworkModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      console.log("Changing account");
      if (onClose) {
        onClose();
      }
    } catch (switchError) {
      console.error(switchError);
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-700 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="text-center text-white">
            <h3 className="text-lg leading-6 font-medium mb-3">
              Switch Network
            </h3>
            <p className="text-sm">
              Please switch to the appropriate network to continue.
            </p>
          </div>
          <div className="mt-5 sm:mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none"
              onClick={() => switchNetwork("0x1")}
            >
              Switch to Ethereum Mainnet
            </button>
            <button
              type="button"
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none"
              onClick={() => switchNetwork("0x7A69")}
            >
              Switch to Hardhat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkModal;
