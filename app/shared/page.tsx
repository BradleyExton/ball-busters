"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { players } from "../data/players";
import { FIELD_POSITIONS, type InningAssignments } from "../utils/positionUtils";

function SharedGameContent() {
  const searchParams = useSearchParams();

  // Load shared game state from URL parameters
  const sharedAttendance = searchParams.get("attendance");
  const sharedBattingOrder = searchParams.get("batting");
  const sharedPitchingOrder = searchParams.get("pitching");
  const sharedPositions = searchParams.get("positions");

  let attendingPlayers: string[] = [];
  let battingOrder: string[] = [];
  let pitchingOrder: { battingPosition: number; batter: string; pitcher: string }[] = [];
  let positionAssignments: InningAssignments[] = [];

  try {
    if (sharedAttendance) {
      attendingPlayers = JSON.parse(decodeURIComponent(sharedAttendance));
    }
    if (sharedBattingOrder) {
      battingOrder = JSON.parse(decodeURIComponent(sharedBattingOrder));
    }
    if (sharedPitchingOrder) {
      pitchingOrder = JSON.parse(decodeURIComponent(sharedPitchingOrder));
    }
    if (sharedPositions) {
      positionAssignments = JSON.parse(decodeURIComponent(sharedPositions));
    }
  } catch (error) {
    console.error("Error parsing shared game data:", error);
  }

  const getPlayerGender = (playerName: string) => {
    return players.find((p) => p.name === playerName)?.gender === "MALE" ? "M" : "F";
  };

  const getPitcherForBattingPosition = (battingPosition: number): string | null => {
    const pitchingAssignment = pitchingOrder.find((p) => p.battingPosition === battingPosition);
    return pitchingAssignment ? pitchingAssignment.pitcher : null;
  };

  const getPitcherPriority = (pitcherName: string): number => {
    const pitcher = players.find((p) => p.name === pitcherName);
    return pitcher?.pitchingPriority || 0;
  };

  const getPriorityIndicatorColor = (priority: number): string => {
    switch (priority) {
      case 1:
        return "bg-green-500"; // Primary
      case 2:
        return "bg-blue-500"; // Secondary
      case 3:
        return "bg-yellow-500"; // Tertiary
      default:
        return "bg-red-500"; // Emergency
    }
  };

  if (!sharedAttendance || attendingPlayers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Share Link</h2>
          <p className="text-gray-600">
            This share link appears to be invalid or incomplete. Please request a new share link
            from your team organizer.
          </p>
        </div>
      </div>
    );
  }

  const innings = positionAssignments.map((assignments, index) => ({
    inningNumber: index + 1,
    assignments,
  }));

  return (
    <div className="min-h-screen bg-gray-50 print:min-h-screen print:bg-white print:flex print:items-center print:justify-center">
      {/* Header */}
      <div className="bg-[#D22237] shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex justify-center sm:justify-start">
            <div className="flex-shrink-0">
              <Image
                src="/ballbusters.png"
                alt="Ball Busters Logo"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 print:py-2 print:space-y-4 print:w-full print:max-w-none print:px-8">
        {/* Read-only Banner with Edit Button */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium text-blue-800">
                Read-only view - This game plan has been shared with you
              </p>
            </div>
            <a
              href={`/?attendance=${searchParams.get("attendance")}&batting=${searchParams.get("batting")}&pitching=${searchParams.get("pitching")}&positions=${searchParams.get("positions")}`}
              className="px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </a>
          </div>
        </div>

        {/* Batting Order */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Batting Order</h1>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 print:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D22237]">
                  <th className="px-6 py-3 text-left font-semibold text-white">Position</th>
                  <th className="px-6 py-3 text-left font-semibold text-white">Player</th>
                  <th className="px-6 py-3 text-left font-semibold text-white">Gender</th>
                  <th className="px-6 py-3 text-left font-semibold text-white">Pitcher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {battingOrder.map((player, index) => {
                  const pitcher = getPitcherForBattingPosition(index + 1);
                  const priority = pitcher ? getPitcherPriority(pitcher) : 0;

                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-[#354d74]/10" : "bg-white"}>
                      <td className="px-6 py-4 font-medium text-white bg-[#354d74]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{player}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getPlayerGender(player) === "M"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {getPlayerGender(player)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {pitcher ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${getPriorityIndicatorColor(priority)}`}
                              title={`Priority ${priority}`}
                            ></span>
                            {pitcher}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="block sm:hidden space-y-3 print:hidden">
            {battingOrder.map((player, index) => {
              const pitcher = getPitcherForBattingPosition(index + 1);
              const priority = pitcher ? getPitcherPriority(pitcher) : 0;

              return (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D22237] text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">{player}</div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            getPlayerGender(player) === "M"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {getPlayerGender(player) === "M" ? "Male" : "Female"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {pitcher && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pitcher:</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${getPriorityIndicatorColor(priority)}`}
                            title={`Priority ${priority}`}
                          ></span>
                          <span className="text-sm font-medium text-gray-900">{pitcher}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Field Positions */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Team Positions</h1>

          {/* Mobile View - Cards per inning */}
          <div className="block lg:hidden space-y-6 print:hidden">
            {innings.map((inning) => (
              <div
                key={inning.inningNumber}
                className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#D22237] mb-3">
                  Inning {inning.inningNumber}
                </h3>
                <div className="space-y-2">
                  {FIELD_POSITIONS.map((position) => (
                    <div
                      key={`${inning.inningNumber}-${position}`}
                      className="flex justify-between items-center py-2 px-3 bg-white/40 backdrop-blur-sm rounded border border-white/20"
                    >
                      <span className="text-sm font-medium text-[#354d74]">{position}</span>
                      <span className="text-sm text-gray-900">
                        {inning.assignments[position] || "—"}
                      </span>
                    </div>
                  ))}
                  {inning.assignments.bench && inning.assignments.bench.length > 0 && (
                    <div className="py-2 px-3 bg-[#354d74]/20 backdrop-blur-sm rounded border border-white/20">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-[#354d74] flex-shrink-0">
                          Bench
                        </span>
                        <div className="flex-1 ml-3">
                          <div className="flex flex-wrap gap-1">
                            {inning.assignments.bench.map((player, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-[#354d74]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs shadow-md"
                              >
                                {player}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 print:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D22237]">
                  <th className="px-6 py-3 text-left font-semibold text-white">
                    Position
                  </th>
                  {innings.map((inning) => (
                    <th
                      key={inning.inningNumber}
                      className="px-6 py-3 text-center font-semibold text-white min-w-[100px]"
                    >
                      Inning {inning.inningNumber}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {FIELD_POSITIONS.map((position, index) => (
                  <tr key={position} className={index % 2 === 0 ? "bg-[#354d74]/10" : "bg-white"}>
                    <td className="px-6 py-4 font-medium text-white bg-[#354d74]">
                      {position}
                    </td>
                    {innings.map((inning) => (
                      <td
                        key={`${position}-${inning.inningNumber}`}
                        className="px-6 py-4 text-center text-gray-900 font-medium"
                      >
                        {inning.assignments[position] || (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-[#354d74] bg-[#354d74]/20">
                  <td className="px-6 py-4 font-semibold text-white bg-[#354d74]">
                    Bench
                  </td>
                  {innings.map((inning) => (
                    <td
                      key={`bench-${inning.inningNumber}`}
                      className="px-6 py-4 text-center"
                    >
                      {inning.assignments.bench && inning.assignments.bench.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {inning.assignments.bench.map((player, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-[#354d74] text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              {player}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#D22237] mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Ball Busters</h3>
            <p className="text-red-100 text-sm">
              Fair play • Smart lineups • Team management
            </p>
            <p className="text-red-200 text-xs mt-3">© 2025 Ball Busters Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SharedGame() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#D22237] rounded-full flex items-center justify-center animate-spin">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-gray-600">Loading Game Plan...</p>
          </div>
        </div>
      }
    >
      <SharedGameContent />
    </Suspense>
  );
}