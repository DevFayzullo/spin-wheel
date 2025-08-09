import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [items, setItems] = useState([
    "🍕 Pizza",
    "🍔 Burger",
    "🍩 Donut",
    "☕ Coffee",
    "🎁 Gift",
    "📱 iPhone",
  ]);
  const [input, setInput] = useState("");
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fact, setFact] = useState("");
  const wheelRef = useRef(null);
  const audioRef = useRef(new Audio("/spin-sound.mp3"));

  const segmentAngle = 360 / items.length;

  const handleAddItem = () => {
    if (input.trim()) {
      setItems((prev) => [...prev, input.trim()]);
      setInput("");
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;
    const spinAngle = angle + 360 * 5 + Math.floor(Math.random() * 360);
    const index =
      Math.floor(((360 - (spinAngle % 360)) / 360) * items.length) %
      items.length;
    const result = items[index];

    setIsSpinning(true);
    setAngle(spinAngle);
    wheelRef.current.style.transition =
      "transform 4s cubic-bezier(0.2, 0.7, 0.4, 1)";
    wheelRef.current.style.transform = `rotate(${spinAngle}deg)`;

    audioRef.current.currentTime = 0;
    audioRef.current.play();

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedItem(result);
      setHistory((prev) => [result, ...prev]);
      // setFact(funFacts[result] || "No fun fact available, but still awesome!");
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center p-4 px-2">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-indigo-700 text-center">
        🎡 Custom Spin Wheel
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-2 mb-6 w-full max-w-md">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter item"
          className="flex-1 border p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleAddItem}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow-md">
          Add
        </button>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80">
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-[10px] border-indigo-400 shadow-2xl bg-white relative"
          style={{ transition: "transform 0s" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-left text-[11px] sm:text-sm text-center font-semibold text-indigo-800"
              style={{
                transform: `rotate(${i * segmentAngle}deg) translateX(50%)`,
                transformOrigin: "100% 100%",
              }}>
              {item}
            </div>
          ))}
        </div>

        {/* Premium styled pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-60 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg" />
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-lg disabled:opacity-50">
        {isSpinning ? "Spinning..." : "Spin"}
      </button>

      {selectedItem && (
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-green-700">
            🎉 Result: {selectedItem}
          </div>
          <p className="mt-2 text-sm text-gray-700 italic max-w-sm">
            💡 {fact}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">📜 History</h2>
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:underline">
              Clear All
            </button>
          </div>
          <ul className="list-disc list-inside bg-white p-4 rounded shadow">
            {history.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
