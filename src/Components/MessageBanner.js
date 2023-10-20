import React from "react";

function MessageBanner({ message, type, onClose, withTimeout }) {
  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-yellow-500";

  React.useEffect(() => {
    if (withTimeout) {
      const timer = setTimeout(onClose, 5000); // Auto-hide after 5 seconds
      return () => clearTimeout(timer); // Clear the timer if the component is unmounted
    }
  }, [onClose, withTimeout]);

  return (
    <div
      className={`fixed top-0 left-0 w-full p-4 ${bgColor} text-white text-center transition-transform transform ease-in-out duration-700 ${
        message ? "translate-y-0" : "-translate-y-full"
      }`}
      role="alert"
    >
      {message}
      <button onClick={onClose} className="absolute top-2 right-2 text-white">
        ×
      </button>
    </div>
  );
}

export default MessageBanner;
