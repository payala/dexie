import react from "@heroicons/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSlippage } from "../store/reducers/dexie";

function SlippageInfo() {
  const slippage = useSelector((state) => state.dexie.slippage);

  const dispatch = useDispatch();

  const color_05 = slippage === 0.5 ? "bg-blue-500" : "bg-gray-600";
  const color_10 = slippage === 1.0 ? "bg-blue-500" : "bg-gray-600";
  const color_20 = slippage === 2.0 ? "bg-blue-500" : "bg-gray-600";

  const set05 = () => {
    dispatch(setSlippage(0.5));
  };

  const set10 = () => {
    dispatch(setSlippage(1.0));
  };

  const set20 = () => {
    dispatch(setSlippage(2.0));
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-2">
      <div className="mb-2">Max Slippage</div>
      <div className="flex justify-between">
        <button
          className={`px-4 py-1 rounded-full ${color_05} text-white`}
          onClick={set05}
        >
          0.5%
        </button>
        <button
          className={`px-4 py-1 rounded-full ${color_10} text-white`}
          onClick={set10}
        >
          1%
        </button>
        <button
          className={`px-4 py-1 rounded-full ${color_20} text-white`}
          onClick={set20}
        >
          2%
        </button>
      </div>
    </div>
  );
}

export default SlippageInfo;
