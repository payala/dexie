import React from "react";

function SwapDetails() {
  return (
    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-4">
      <button className="bg-gray-800 p-2 rounded-full">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  );
}

export default SwapDetails;
