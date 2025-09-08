"use client";

import { useState } from "react";
import Image from "next/image";
import PositionsTable from "./PositionsTable";
import AttendanceForm from "./AttendanceForm";
import BattingOrder from "./Batting";
import { players } from "./data/players";

export default function Home() {
  // Initialize with all players attending by default
  const [attendingPlayers, setAttendingPlayers] = useState<string[]>(
    players.map((player) => player.name)
  );

  const [isGameGenerated, setIsGameGenerated] = useState(false);
  const [battingOrder, setBattingOrder] = useState<string[]>([]);

  const handleAttendanceChange = (playerName: string, isAttending: boolean) => {
    if (isAttending) {
      setAttendingPlayers((prev) => [...prev, playerName]);
    } else {
      setAttendingPlayers((prev) => prev.filter((name) => name !== playerName));
    }
    // Reset game when attendance changes
    setIsGameGenerated(false);
    setBattingOrder([]);
  };

  const generateGame = () => {
    // Generate batting order with randomization
    const availablePlayers = players.filter((player) =>
      attendingPlayers.includes(player.name)
    );

    // Shuffle players within gender groups for randomization
    const males = availablePlayers
      .filter((p) => p.gender === "MALE")
      .sort(() => Math.random() - 0.5); // Randomize male order

    const females = availablePlayers
      .filter((p) => p.gender === "FEMALE")
      .sort(() => Math.random() - 0.5); // Randomize female order

    const order: string[] = [];
    let maleIndex = 0;
    let femaleIndex = 0;

    // Randomly decide starting gender (male vs female first)
    const startWithMale = Math.random() < 0.5;

    // Alternate between male and female players with random starting point
    for (let i = 0; i < availablePlayers.length; i++) {
      const shouldUseMale = startWithMale ? i % 2 === 0 : i % 2 === 1;

      if (shouldUseMale && maleIndex < males.length) {
        order.push(males[maleIndex].name);
        maleIndex++;
      } else if (femaleIndex < females.length) {
        order.push(females[femaleIndex].name);
        femaleIndex++;
      } else if (maleIndex < males.length) {
        order.push(males[maleIndex].name);
        maleIndex++;
      }
    }

    setBattingOrder(order);
    setIsGameGenerated(true);
  };

  const resetGame = () => {
    setIsGameGenerated(false);
    setBattingOrder([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#D22237] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Ball Busters
          </h1>
          <p className="text-red-100 mt-1">Team Management System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <AttendanceForm
          attendingPlayers={attendingPlayers}
          onAttendanceChange={handleAttendanceChange}
        />

        {/* Game Generation Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Game Setup
              </h2>
              <p className="text-gray-600 mt-1">
                Generate batting order and field positions for the game
              </p>
            </div>
            <div className="flex space-x-3">
              {!isGameGenerated ? (
                <button
                  onClick={generateGame}
                  disabled={attendingPlayers.length === 0}
                  className="px-6 py-3 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Generate Game
                </button>
              ) : (
                <>
                  <button
                    onClick={generateGame}
                    className="px-4 py-2 bg-[#354d74] text-white rounded-lg hover:bg-[#2a3d5f] hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <BattingOrder
          attendingPlayers={attendingPlayers}
          battingOrder={battingOrder}
          isGenerated={isGameGenerated}
        />
        <PositionsTable
          attendingPlayers={attendingPlayers}
          isGenerated={isGameGenerated}
        />
      </div>

      {/* Footer */}
      <footer className="bg-[#D22237] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Ball Busters</h3>
            <p className="text-red-100 text-sm">
              Fair play • Smart lineups • Team management
            </p>
            <p className="text-red-200 text-xs mt-3">
              © 2025 Ball Busters Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
