import React from "react";

export default function Footer({ onToggleGame, gameMode, onReleaseArrow, arrowsRemaining }) {
  if (gameMode) {
    // In game mode, show only the Release Arrow button centered below canvas
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="text-center space-y-2">
          <div className="text-sm text-white/80 mb-1">
            🏹 Arrows Remaining: <span className="text-yellow-400 font-bold">{arrowsRemaining}</span>
          </div>
          <button
            onClick={onReleaseArrow}
            disabled={arrowsRemaining <= 0}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold text-white"
          >
            🏹 Release Arrow
          </button>
        </div>
      </div>
    );
  }

  return (
    <footer className="p-6 text-white/70 border-t border-white/10">
      {/* 🎮 Game Mode Button */}
      <div className="text-center mb-4">
        <button
          onClick={onToggleGame}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:scale-105 transition-all"
        >
          🎮 Enter Game Mode
        </button>
      </div>
      <div className="border-t border-white/20 my-4"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p className="text-left w-full md:w-auto">
          © 2025 Roshan Sah — Made with ❤️ using React & Three.js
        </p>

        <div className="flex justify-center items-center gap-6">
          {/* WhatsApp */}
          <a
            href="https://wa.me/918368293101"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <img
              src="/icons/whatsapp.svg"
              alt="WhatsApp"
              className="w-6 h-6 opacity-80 hover:opacity-100 transition-all"
            />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/roshan-sah-0b1371219"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <img
              src="/icons/linkedin.svg"
              alt="LinkedIn"
              className="w-6 h-6 opacity-80 hover:opacity-100 transition-all"
            />
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/roshankumar0735-cmd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <img
              src="/icons/github.svg"
              alt="GitHub"
              className="w-6 h-6 opacity-80 hover:opacity-100 transition-all"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}