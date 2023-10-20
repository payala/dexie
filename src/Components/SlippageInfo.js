function SlippageInfo() {
  return (
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
  );
}

export default SlippageInfo;
