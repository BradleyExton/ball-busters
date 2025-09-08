"use client";

import { useState } from "react";
import { players } from "../data/players";

interface BattingOrderProps {
  attendingPlayers: string[];
  battingOrder: string[];
  isGenerated: boolean;
}

export default function BattingOrder({
  attendingPlayers,
  battingOrder,
  isGenerated,
}: BattingOrderProps) {
  // Filter players to only include those attending
  const availablePlayers = players.filter((player) =>
    attendingPlayers.includes(player.name)
  );

  // Generate batting order alternating male/female when possible
  // This logic is now handled by the parent component

  const getPlayerGender = (playerName: string) => {
    return players.find((p) => p.name === playerName)?.gender === "MALE"
      ? "M"
      : "F";
  };

  if (availablePlayers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Batting Order
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>Select attending players to generate batting order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Batting Order</h2>
      </div>

      {isGenerated && battingOrder.length > 0 ? (
        <div>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-2">
            {battingOrder.map((playerName, index) => (
              <div
                key={`${playerName}-${index}`}
                className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 shadow-md hover:bg-white/70 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-[#D22237]/90 backdrop-blur-sm text-white rounded-full font-bold text-xs shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {playerName}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({getPlayerGender(playerName)})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D22237]">
                  <th className="px-3 py-2 text-center font-semibold text-white text-sm">
                    Position
                  </th>
                  {battingOrder.map((_, index) => (
                    <th
                      key={index}
                      className="px-2 py-2 text-center font-semibold text-white min-w-[80px] text-sm"
                    >
                      {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="px-3 py-2 font-medium text-white bg-[#354d74] text-sm">
                    Player
                  </td>
                  {battingOrder.map((playerName, index) => (
                    <td
                      key={`${playerName}-${index}`}
                      className="px-2 py-2 text-center text-xs text-[#354d74] font-medium"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-xs leading-tight">
                          {playerName}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          ({getPlayerGender(playerName)})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
            <div className="text-sm text-[#354d74] font-medium">
              Total Batters: {battingOrder.length}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {availablePlayers.length === 0
              ? "Select attending players"
              : "Ready to Generate Batting Order"}
          </h3>
          <p className="text-gray-600">
            {availablePlayers.length === 0
              ? "Choose which players are attending to generate a batting order"
              : `Generate game setup for ${availablePlayers.length} players`}
          </p>
        </div>
      )}
    </div>
  );
}
