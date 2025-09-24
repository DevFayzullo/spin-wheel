import ThemeToggle from "./components/ThemeToggle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useEffect, useRef, useState } from "react";
import Wheel from "./components/Wheel";
import {
  encodeItemsToQuery,
  readItemsFromQuery,
  stripItemsFromUrl,
} from "./utils/wheel";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import spinSound from "./sound/spin-sound.mp3";

const defaultItems = ["Pizza", "Burger", "Donut", "Coffee", "Gift", "iPhone"];

export default function App() {
  const { t } = useTranslation();

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

  // Actions: items
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
    confetti({ particleCount: 140, spread: 70, origin: { y: 0.35 } });
  }

  // Utilities
  function shareLink() {
    const url = encodeItemsToQuery(items);
    navigator.clipboard?.writeText(url);
    alert(t("alertShare"));
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
    <>
      <header
        className="
    sticky top-0 inset-x-0 z-50
    border-b border-gray-200 dark:border-gray-800
    bg-white/80 dark:bg-gray-900/80
    backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60
    pt-[env(safe-area-inset-top)]
  ">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-800 dark:text-gray-100">
            Spin Wheel
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="min-h-screen flex flex-col items-center px-4 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        {/* Page container */}
        <div className="mt-12 w-full max-w-5xl">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t("subtitle")}
            </p>
          </header>

          {/* Input & top actions card */}
          <section className="card p-4 sm:p-6">
            {/* Row 1: input + Add */}
            <div className="lg:col-span-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
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
                title={t("addTitle")}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {t("add")}
              </button>
            </div>

            {/* Row 2: Duration / Spins / Sound toggle */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {t("duration")}
                </span>
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
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {t("spins")}
                </span>
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
                title={muted ? t("muteTitleOff") : t("muteTitleOn")}>
                {muted ? t("soundOff") : t("soundOn")}
              </button>

              <div className="ml-auto">
                <button
                  onClick={clearAllItems}
                  className="text-sm text-red-600 hover:underline">
                  {t("clearAllItems")}
                </button>
              </div>
            </div>
          </section>

          {/* Items card */}
          <section className="card p-4 sm:p-6 mt-6">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                {t("items", { count: items.length })}
              </div>
            </div>

            {/* Chips */}
            <div className="min-h-[48px]">
              <div className="flex flex-wrap gap-2">
                {items.map((it, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                    <span className="text-sm">{it}</span>
                    <button
                      className="rounded-full w-5 h-5 flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => removeItem(i)}
                      aria-label={`Remove ${it}`}
                      title="Remove">
                      ×
                    </button>
                  </span>
                ))}
                {items.length === 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("noItems")}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4" />

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={shareLink} className="btn text-sm">
                {t("shareLink")}
              </button>
              <button onClick={exportTxt} className="btn text-sm">
                {t("exportTxt")}
              </button>
              <label className="btn text-sm cursor-pointer">
                {t("import")}
                <input
                  type="file"
                  accept=".txt,.csv"
                  className="hidden"
                  onChange={onImportFile}
                />
              </label>
            </div>
          </section>

          {/* Wheel */}
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

          {/* Live region (a11y) */}
          <div aria-live="polite" className="sr-only" ref={liveRegionRef} />

          {/* Result */}
          {selected && (
            <section
              ref={resultCardRef}
              className="card p-4 sm:p-6 mt-6 text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {t("result", { value: selected })}
              </div>
              <div className="mt-3 flex gap-2 justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`Result: ${selected}`);
                  }}
                  className="btn">
                  {t("copyResult")}
                </button>
                <button onClick={saveResultImage} className="btn">
                  {t("saveAsImage")}
                </button>
                <button onClick={() => setSelected(null)} className="btn">
                  {t("clear")}
                </button>
              </div>
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className="card p-4 sm:p-6 mt-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {t("history")}
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:underline">
                  {t("clearHistory")}
                </button>
              </div>
              <ul className="list-disc list-inside bg-gray-50/70 dark:bg-gray-800/50 p-4 rounded-lg max-h-64 overflow-auto">
                {history.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-10 mb-6 text-xs text-center text-gray-500 dark:text-gray-400">
            {t("builtBy")}{" "}
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
              <a href="http://devfayzullo.life">DevFayzullo</a>
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}
