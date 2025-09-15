import { useEffect, useRef, useState } from "react";
import Wheel from "./components/Wheel";
import {
  encodeItemsToQuery,
  readItemsFromQuery,
  stripItemsFromUrl,
} from "./utils/wheel";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import spinSound from "./sound/spin-sound.mp3"; // add your audio file here

const defaultItems = ["Pizza", "Burger", "Donut", "Coffee", "Gift", "iPhone"];

export default function App() {
  // Initial: URL items > localStorage > defaults
  const initial =
    readItemsFromQuery() ||
    JSON.parse(localStorage.getItem("items") || "null") ||
    defaultItems;

  const [items, setItems] = useState(initial);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem("history") || "[]")
  );
  const [selected, setSelected] = useState(null);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(4000);
  const [spins, setSpins] = useState(5);

  const liveRegionRef = useRef(null);
  const resultCardRef = useRef(null);

  // Sound setup
  const audioRef = useRef(null);
  useEffect(() => {
    const a = new Audio(spinSound);
    a.loop = true; // loop while spinning
    audioRef.current = a;
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  function addItem() {
    const v = input.trim();
    if (!v) return;
    if (items.includes(v)) {
      setInput("");
      return;
    }
    setItems((prev) => [...prev, v]);
    setInput("");
  }
  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearAllItems() {
    setItems([]);
    try {
      localStorage.setItem("items", JSON.stringify([]));
    } catch {}
    stripItemsFromUrl(); // prevent URL from re-populating after refresh
  }
  function clearHistory() {
    setHistory([]);
  }

  // Audio control
  function startSpinSound() {
    if (muted) return;
    try {
      audioRef.current?.pause();
      audioRef.current.currentTime = 0;
      audioRef.current?.play().catch(() => {});
    } catch {}
  }
  function stopSpinSound() {
    try {
      audioRef.current?.pause();
    } catch {}
  }

  // Finish handler with confetti
  function onFinish(result) {
    stopSpinSound();
    setSelected(result);
    setHistory((prev) => [result, ...prev]);
    if (liveRegionRef.current)
      liveRegionRef.current.textContent = `Result: ${result}`;
    // Confetti burst
    confetti({ particleCount: 140, spread: 70, origin: { y: 0.35 } });
  }

  // Actions
  function shareLink() {
    const url = encodeItemsToQuery(items);
    navigator.clipboard?.writeText(url);
    alert("Sharable link copied to clipboard!");
  }
  function exportTxt() {
    const blob = new Blob([items.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wheel-items.txt";
    a.click();
  }
  function onImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const arr = text
        .split(/[\n,]/g)
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) setItems(arr);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  async function saveResultImage() {
    // capture the result card (if visible)
    if (!resultCardRef.current) return;
    const canvas = await html2canvas(resultCardRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "spin-result.png";
    a.click();
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      {/* Page container with generous top margin */}
      <div className="mt-12 w-full max-w-5xl">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-700">🎡 Spin Wheel</h1>
          <p className="text-gray-600 mt-2">
            Fair spins, clean design, and shareable lists.
          </p>
        </header>

        {/* Input & top actions card */}
        <section className="card p-4 sm:p-6">
          {/* Row 1: input + Add + right actions (Share/Export/Import MOVED DOWN, see Items card) */}
          <div className="lg:col-span-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an item and press Enter"
              className="input flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
            />
            <button
              onClick={addItem}
              className="px-5 py-2.5 rounded-xl text-white
               bg-gradient-to-r from-indigo-600 to-violet-600
               hover:from-indigo-500 hover:to-violet-500
               shadow-[0_10px_25px_rgba(79,70,229,0.35)]
               focus:outline-none focus:ring-2 focus:ring-indigo-300
               flex items-center gap-2"
              title="Add item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add
            </button>
          </div>

          {/* Row 2: Duration / Spins / Sound toggle */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">Duration (ms)</span>
              <input
                type="number"
                min={800}
                max={8000}
                step={200}
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
                className="w-24 input"
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">Spins</span>
              <input
                type="number"
                min={2}
                max={10}
                value={spins}
                onChange={(e) => setSpins(+e.target.value)}
                className="w-20 input"
              />
            </label>

            <button
              onClick={() => setMuted((m) => !m)}
              className="btn"
              aria-pressed={muted}
              title={muted ? "Unmute sound" : "Mute sound"}>
              {muted ? "🔇 Sound off" : "🔊 Sound on"}
            </button>

            <div className="ml-auto">
              <button
                onClick={clearAllItems}
                className="text-sm text-red-600 hover:underline">
                Clear all items
              </button>
            </div>
          </div>
        </section>

        {/* Items card (with actions centered below) */}
        <section className="card p-4 sm:p-6 mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-gray-700">
              Items ({items.length})
            </div>
          </div>

          {/* Chips */}
          <div className="min-h-[48px]">
            <div className="flex flex-wrap gap-2">
              {items.map((it, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-800 px-2 py-1 rounded-full">
                  <span className="text-sm">{it}</span>
                  <button
                    className="rounded-full w-5 h-5 flex items-center justify-center bg-white border hover:bg-gray-50"
                    onClick={() => removeItem(i)}
                    aria-label={`Remove ${it}`}
                    title="Remove">
                    ×
                  </button>
                </span>
              ))}
              {items.length === 0 && (
                <span className="text-sm text-gray-500">
                  No items yet. Add some above.
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mt-4 pt-4" />

          {/* Actions centered below */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={shareLink} className="btn text-sm">
              Share link
            </button>
            <button onClick={exportTxt} className="btn text-sm">
              Export .txt
            </button>
            <label className="btn text-sm cursor-pointer">
              Import
              <input
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={onImportFile}
              />
            </label>
          </div>
        </section>

        {/* Wheel card centered */}
        <section className="card p-6 mt-6">
          <div className="flex justify-center">
            <Wheel
              items={items}
              onFinish={onFinish}
              onSpinStart={startSpinSound}
              durationMs={duration}
              spins={spins}
            />
          </div>
        </section>

        {/* Live region for a11y */}
        <div aria-live="polite" className="sr-only" ref={liveRegionRef} />

        {/* Result card */}
        {selected && (
          <section
            ref={resultCardRef}
            className="card p-4 sm:p-6 mt-6 text-center">
            <div className="text-lg font-bold text-emerald-700">
              🎉 Result: {selected}
            </div>
            <div className="mt-3 flex gap-2 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`Result: ${selected}`);
                }}
                className="btn">
                Copy result
              </button>
              <button onClick={saveResultImage} className="btn">
                Save as image
              </button>
              <button onClick={() => setSelected(null)} className="btn">
                Clear
              </button>
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="card p-4 sm:p-6 mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">
                📜 History
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:underline">
                Clear history
              </button>
            </div>
            <ul className="list-disc list-inside bg-gray-50/70 p-4 rounded-lg max-h-64 overflow-auto">
              {history.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-10 mb-6 text-xs text-center text-gray-500">
          Built by{" "}
          <span className="font-semibold text-indigo-700">
            <a href="http://devfayzullo.life">DevFayzullo</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
