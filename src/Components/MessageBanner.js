import React from "react";

function MessageBanner({ message, type, onClose, withTimeout }) {
  const [state, setState] = React.useState("hidden");
  const appearTime = 100;
  const visibleTime = 5000;
  const fadeTime = 700;

  const bgColor =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-yellow-500";

  React.useEffect(() => {
    let timer;
    if (state === "hidden" && message) {
      timer = setTimeout(() => {
        setState("visible");
      }, appearTime);
    } else if (state === "visible" && withTimeout) {
      timer = setTimeout(() => {
        setState("hiding");
      }, visibleTime);
    } else if (state === "hiding") {
      timer = setTimeout(() => {
        onClose();
      }, fadeTime);
    }
    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, [message, onClose, state, withTimeout]);

  return (
    <div
      className={`fixed top-0 left-0 w-full p-4 ${bgColor} text-white text-center transition-transform transform ease-in-out duration-700 ${
        state === "visible" ? "translate-y-0" : "-translate-y-full"
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
