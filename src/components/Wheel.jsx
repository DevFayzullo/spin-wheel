import React, { useRef, useState } from "react";

export default function Wheel({ items, onFinish }) {
  const wheelRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;

    const newAngle = angle + 360 * 5 + Math.floor(Math.random() * 360);
    const selectedIndex =
      Math.floor(((360 - (newAngle % 360)) / 360) * items.length) %
      items.length;
    const selectedItem = items[selectedIndex];

    setIsSpinning(true);
    setAngle(newAngle);

    wheelRef.current.style.transition = "transform 4s ease-out";
    wheelRef.current.style.transform = `rotate(${newAngle}deg)`;

    setTimeout(() => {
      setIsSpinning(false);
      onFinish(selectedItem);
    }, 4000);
  };

  const segmentAngle = 360 / items.length;

  return (
    <div className="relative">
      <div
        ref={wheelRef}
        className="w-[300px] h-[300px] rounded-full border-8 border-gray-700 relative"
        style={{ transition: "transform 0s" }}>
        {items.map((item, i) => {
          const rotate = i * segmentAngle;
          return (
            <div
              key={i}
              className="absolute w-1/2 h-1/2 origin-bottom-left text-xs font-medium text-center"
              style={{
                transform: `rotate(${rotate}deg) translateX(50%)`,
                transformOrigin: "100% 100%",
              }}>
              {item}
            </div>
          );
        })}
      </div>
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {isSpinning ? "Spinning..." : "Spin"}
      </button>
    </div>
  );
}
