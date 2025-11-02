import React from "react";

export default function HUD({ onStartGame }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white text-center">
      <h1 className="text-5xl font-bold mb-4">Roshan Kumar</h1>
      <p className="text-lg mb-8">Welcome to my Gamified 3D Portfolio</p>
      <button
        onClick={onStartGame}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
      >
        🎮 Enter Game Mode
      </button>
    </div>
  );
}
