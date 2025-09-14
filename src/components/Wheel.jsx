import React, { useEffect, useMemo, useRef, useState } from "react";
import { cryptoRandomInt, contrastOn, PALETTE } from "../utils/wheel";

/** Wheel with bottom pointer and centered spin control */
export default function Wheel({
  items,
  onFinish,
  onSpinStart, // start audio outside
  durationMs = 4000,
  spins = 5,
  preventImmediateRepeat = true,
}) {
  const wheelRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const lastIndexRef = useRef(null);

  const sliceAngle = 360 / Math.max(items.length || 1, 1);

  // Build slice paths & labels (crisp SVG)
  const slices = useMemo(() => {
    const radius = 180;
    const result = [];
    for (let i = 0; i < items.length; i++) {
      const start = (i * sliceAngle - 90) * (Math.PI / 180);
      const end = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
      const x1 = radius * Math.cos(start);
      const y1 = radius * Math.sin(start);
      const x2 = radius * Math.cos(end);
      const y2 = radius * Math.sin(end);
      const largeArc = sliceAngle > 180 ? 1 : 0;

      const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const mid = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180);
      const lx = radius * 0.62 * Math.cos(mid);
      const ly = radius * 0.62 * Math.sin(mid);
      const fill = PALETTE[i % PALETTE.length];
      result.push({ i, path, labelX: lx, labelY: ly, fill });
    }
    return result;
  }, [items.length, sliceAngle]);

  /** Map final rotation to index when the pointer is at the BOTTOM.
   *  We keep the original “pointer-at-top” mapping but shift by +180°.
   */
  function indexForEndAngle(endDeg) {
    const offset = ((endDeg % 360) + 360) % 360; // 0..359
    const pointerAtTopDeg = (offset + 180) % 360; // shift because pointer at bottom
    const slice = 360 / items.length;
    const idx = Math.floor(((360 - pointerAtTopDeg) % 360) / slice);
    return idx;
  }

  function nextAngleAvoidingRepeat() {
    if (items.length < 2) return angle + 360 * spins + cryptoRandomInt(360);
    for (let t = 0; t < 10; t++) {
      const rand = cryptoRandomInt(360);
      const end = angle + 360 * spins + rand;
      const idx = indexForEndAngle(end);
      if (
        !preventImmediateRepeat ||
        lastIndexRef.current === null ||
        idx !== lastIndexRef.current
      ) {
        return end;
      }
    }
    return angle + 360 * spins + cryptoRandomInt(360);
  }

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    const endAngle = nextAngleAvoidingRepeat();
    setIsSpinning(true);
    setAngle(endAngle);

    onSpinStart?.();

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${durationMs}ms cubic-bezier(.1,.9,.2,1)`;
      wheelRef.current.style.transform = `rotate(${endAngle}deg)`;
    }
    const finalIdx = indexForEndAngle(endAngle);
    const result = items[finalIdx];
    lastIndexRef.current = finalIdx;

    window.setTimeout(() => {
      setIsSpinning(false);
      onFinish?.(result);
    }, durationMs);
  };

  // Space/Enter support
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === " " || e.key === "Enter") && !isSpinning) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSpinning]);

  return (
    <div className="relative select-none">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
        <svg
          className="w-full h-full drop-shadow-xl"
          viewBox="-200 -200 400 400"
          ref={wheelRef}
          aria-label="Spin wheel"
          role="img">
          <circle
            cx="0"
            cy="0"
            r="190"
            fill="#ffffff"
            stroke="#818CF8"
            strokeWidth="12"
          />
          {slices.map(({ i, path, labelX, labelY, fill }) => (
            <g key={i}>
              <path d={path} fill={fill} />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="700"
                style={{ pointerEvents: "none" }}
                fill={contrastOn(fill)}>
                {items[i]}
              </text>
            </g>
          ))}
        </svg>

        {/* Pointer at the BOTTOM (pointing up) */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-rose-600 drop-shadow-lg" />
        </div>
      </div>

      {/* Centered spin control */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          onClick={spin}
          disabled={isSpinning || items.length < 2}
          className="px-6 py-3 rounded-xl text-white disabled:opacity-50
                     bg-gradient-to-r from-indigo-600 to-violet-600
                     hover:from-indigo-500 hover:to-violet-500
                     shadow-[0_10px_25px_rgba(79,70,229,0.35)]
                     focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-disabled={isSpinning || items.length < 2}>
          {isSpinning ? "Spinning…" : "Spin"}
        </button>
        <span className="text-sm text-gray-600">
          {items.length < 2
            ? "Add at least 2 items"
            : "Press Space/Enter to spin"}
        </span>
      </div>
    </div>
  );
}
