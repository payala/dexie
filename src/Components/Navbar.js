import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { loadAccount } from "../store/interactions";

function Navbar() {
  const [loadingAccount, setLoadingAccount] = React.useState(false);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account);
  const handleConnectWallet = async () => {
    setLoadingAccount(true);
    await loadAccount(dispatch);
    setLoadingAccount(false);
  };
  return (
    <nav>
      <div className="container mx-auto flex justify-end">
        <div className="bg-gray-800 p-4 rounded-lg">
          {account ? (
            <span className="text-white">Wallet: {account}</span>
          ) : (
            <button
              onClick={handleConnectWallet}
              className={`text-white px-4 py-2 rounded ${
                loadingAccount
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              }`}
              disabled={loadingAccount}
            >
              {loadingAccount ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
