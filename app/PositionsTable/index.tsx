"use client";

import { players } from "../data/players";
import { useState } from "react";

// BenchSection component for mobile view
function BenchSection({
  players,
  inningNumber,
}: {
  players: string[];
  inningNumber: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxVisible = 3; // Show max 3 players by default on mobile
  const hasMore = players.length > maxVisible;
  const visiblePlayers = isExpanded ? players : players.slice(0, maxVisible);

  return (
    <div className="py-2 px-3 bg-[#354d74]/20 backdrop-blur-sm rounded border border-white/20">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-[#354d74] flex-shrink-0">
          Bench
        </span>
        <div className="flex-1 ml-3">
          <div className="flex flex-wrap gap-1">
            {visiblePlayers.map((player, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#354d74]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs shadow-md"
              >
                {player}
              </span>
            ))}
            {hasMore && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="inline-block bg-[#354d74]/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs shadow-md hover:bg-[#354d74]/80 transition-colors"
              >
                +{players.length - maxVisible}
              </button>
            )}
          </div>
          {hasMore && isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-1 text-xs text-[#354d74] hover:text-[#354d74]/80 transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Define the softball field positions in order
const FIELD_POSITIONS = [
  "Catcher",
  "1B",
  "2B",
  "3B",
  "Rover",
  "SS",
  "RF",
  "CF",
  "LF",
];

// Map enum values to display names
const POSITION_MAP: { [key: string]: string } = {
  CATCHER: "Catcher",
  FIRST_BASE: "1B",
  SECOND_BASE: "2B",
  THIRD_BASE: "3B",
  SHORTSTOP: "SS",
  LEFT_FIELD: "LF",
  CENTER_FIELD: "CF",
  RIGHT_FIELD: "RF",
  ROVER: "Rover",
};

interface InningAssignments {
  [position: string]: string | string[];
  bench: string[];
}

interface PositionsTableProps {
  attendingPlayers: string[];
  isGenerated: boolean;
}

export default function PositionsTable({
  attendingPlayers,
  isGenerated,
}: PositionsTableProps) {
  // Filter players to only include those attending
  const availablePlayers = players.filter((player) =>
    attendingPlayers.includes(player.name)
  );

  // Helper function to check if a player can play a specific position
  const canPlayerPlayPosition = (player: any, position: string): boolean => {
    // Defensive check for undefined player
    if (!player || !player.playablePositions) {
      console.error(
        "canPlayerPlayPosition called with invalid player:",
        player
      );
      return false;
    }

    // Check if position is in playablePositions
    const canPlayFromPlayable = player.playablePositions.some(
      (pos: string) => POSITION_MAP[pos] === position
    );

    // Check if position matches preferred position (only if not "none")
    const isPreferredPosition =
      player.preferredPosition !== "none" &&
      player.preferredPosition !== null &&
      (POSITION_MAP[player.preferredPosition] === position ||
        player.preferredPosition === position);

    return canPlayFromPlayable || isPreferredPosition;
  };

  // Don't render table if fewer than 9 players (minimum for field positions)
  if (availablePlayers.length < 9) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Team Positions
        </h1>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-amber-800">
                Not enough players attending
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You need at least 9 players to fill all field positions.
                Currently {availablePlayers.length} players are attending.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we can fill all positions with available players
  const positionCoverage = FIELD_POSITIONS.map((position) => {
    const playersForPosition = availablePlayers.filter((player) =>
      canPlayerPlayPosition(player, position)
    );
    return {
      position,
      availablePlayers: playersForPosition.length,
    };
  });

  const uncoverablePositions = positionCoverage.filter(
    (p) => p.availablePlayers === 0
  );

  if (uncoverablePositions.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Team Positions
        </h1>
        <div className="bg-red-50 border-l-4 border-[#D22237] p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-[#D22237]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Cannot fill all positions
              </p>
              <p className="text-sm text-red-700 mt-1">
                No players available for:{" "}
                {uncoverablePositions.map((p) => p.position).join(", ")}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Check player playablePositions or add more players who can play
                these positions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to generate balanced assignments across all innings
  const generateAllInnings = () => {
    const totalInnings = 7;
    const fieldPositions = FIELD_POSITIONS.length; // 9 positions
    const totalPlayers = availablePlayers.length;

    const allInnings: InningAssignments[] = [];

    // Simple round-robin approach with randomization: rotate players through playing positions
    for (let inning = 0; inning < totalInnings; inning++) {
      const assignments: InningAssignments = { bench: [] };

      // Calculate starting index for this inning's rotation with some randomization
      const baseStartIndex = (inning * 5) % totalPlayers;
      const randomOffset = Math.floor(Math.random() * 3); // Add 0-2 random offset
      const startIndex = (baseStartIndex + randomOffset) % totalPlayers;

      // Select 9 players to play this inning with shuffled available players
      const shuffledPlayers = [...availablePlayers].sort(
        () => Math.random() - 0.5
      );
      const playingPlayers: any[] = [];
      for (let i = 0; i < fieldPositions; i++) {
        const playerIndex = (startIndex + i) % totalPlayers;
        playingPlayers.push(shuffledPlayers[playerIndex]);
      }

      // Randomize position assignment order
      const shuffledPositions = [...FIELD_POSITIONS].sort(
        () => Math.random() - 0.5
      );

      // Assign positions - try to give preferred positions first
      const usedPlayers = new Set<string>();
      const remainingPositions = [...shuffledPositions];

      // First pass: preferred positions (with randomization)
      const shuffledPlayingPlayers = [...playingPlayers].sort(
        () => Math.random() - 0.5
      );
      shuffledPlayingPlayers.forEach((player) => {
        if (usedPlayers.has(player.name)) return;

        const preferredPos =
          typeof player.preferredPosition === "string" &&
          player.preferredPosition !== "none"
            ? POSITION_MAP[player.preferredPosition] || player.preferredPosition
            : null;

        if (
          preferredPos &&
          remainingPositions.includes(preferredPos) &&
          canPlayerPlayPosition(player, preferredPos)
        ) {
          assignments[preferredPos] = player.name;
          usedPlayers.add(player.name);
          remainingPositions.splice(
            remainingPositions.indexOf(preferredPos),
            1
          );
        }
      });

      // Second pass: fill remaining positions with constraint-aware assignment
      const remainingPlayers = playingPlayers.filter(
        (player) => !usedPlayers.has(player.name)
      );

      // Use a smarter assignment that tries multiple options before giving up
      const unassignedPlayers = [...remainingPlayers];

      // Sort positions by how many players can fill them (hardest first)
      const sortedRemainingPositions = [...remainingPositions].sort((a, b) => {
        const playersForA = unassignedPlayers.filter((p) =>
          canPlayerPlayPosition(p, a)
        ).length;
        const playersForB = unassignedPlayers.filter((p) =>
          canPlayerPlayPosition(p, b)
        ).length;
        return playersForA - playersForB;
      });

      sortedRemainingPositions.forEach((position) => {
        // Find all unassigned players who can play this position
        const eligiblePlayers = unassignedPlayers.filter((player) =>
          canPlayerPlayPosition(player, position)
        );

        if (eligiblePlayers.length > 0) {
          // Randomly select from eligible players
          const assignedPlayer =
            eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

          assignments[position] = assignedPlayer.name;
          usedPlayers.add(assignedPlayer.name);

          // Remove assigned player from unassigned list
          const playerIndex = unassignedPlayers.indexOf(assignedPlayer);
          unassignedPlayers.splice(playerIndex, 1);
        } else {
          // If no eligible players, try to reassign from already assigned players
          let positionFilled = false;

          // First try: swap with unassigned players
          for (const assignedPosition of Object.keys(assignments)) {
            if (assignedPosition === "bench" || positionFilled) continue;

            const assignedPlayerName = assignments[assignedPosition];
            const assignedPlayer = playingPlayers.find(
              (p) => p.name === assignedPlayerName
            );

            // Check if assigned player can play current position and someone else can take their spot
            if (
              assignedPlayer &&
              canPlayerPlayPosition(assignedPlayer, position)
            ) {
              const replacements = unassignedPlayers.filter((p) =>
                canPlayerPlayPosition(p, assignedPosition)
              );

              if (replacements.length > 0) {
                // Swap them
                const replacement =
                  replacements[Math.floor(Math.random() * replacements.length)];
                assignments[assignedPosition] = replacement.name;
                assignments[position] = assignedPlayer.name;

                // Update unassigned players list
                const replacementIndex = unassignedPlayers.indexOf(replacement);
                unassignedPlayers.splice(replacementIndex, 1);
                positionFilled = true;
                break;
              }
            }
          }

          // Second try: swap between assigned players if first try failed
          if (!positionFilled) {
            for (const assignedPosition1 of Object.keys(assignments)) {
              if (assignedPosition1 === "bench" || positionFilled) continue;

              const player1Name = assignments[assignedPosition1];
              const player1 = playingPlayers.find(
                (p) => p.name === player1Name
              );

              // Check if player1 can play the empty position
              if (player1 && canPlayerPlayPosition(player1, position)) {
                // Look for another assigned player who can take player1's position
                for (const assignedPosition2 of Object.keys(assignments)) {
                  if (
                    assignedPosition2 === "bench" ||
                    assignedPosition2 === assignedPosition1
                  )
                    continue;

                  const player2Name = assignments[assignedPosition2];
                  const player2 = playingPlayers.find(
                    (p) => p.name === player2Name
                  );

                  // Check if player2 can take player1's position
                  if (
                    player2 &&
                    canPlayerPlayPosition(player2, assignedPosition1)
                  ) {
                    // Perform the swap
                    assignments[assignedPosition1] = player2.name;
                    assignments[assignedPosition2] = ""; // Will be filled next
                    assignments[position] = player1.name;
                    positionFilled = true;

                    // Now we need to fill assignedPosition2 with someone
                    // Try unassigned players first
                    const canFillPosition2 = unassignedPlayers.filter((p) =>
                      canPlayerPlayPosition(p, assignedPosition2)
                    );

                    if (canFillPosition2.length > 0) {
                      const filler =
                        canFillPosition2[
                          Math.floor(Math.random() * canFillPosition2.length)
                        ];
                      assignments[assignedPosition2] = filler.name;
                      const fillerIndex = unassignedPlayers.indexOf(filler);
                      unassignedPlayers.splice(fillerIndex, 1);
                    } else {
                      // Put player2 back and try next combination
                      assignments[assignedPosition1] = player1.name;
                      assignments[assignedPosition2] = player2.name;
                      assignments[position] = "";
                      positionFilled = false;
                      continue;
                    }
                    break;
                  }
                }
                if (positionFilled) break;
              }
            }
          }

          // Last resort: if we still can't fill the position, assign any unassigned player
          // This violates position constraints but ensures all positions are filled
          if (!positionFilled && unassignedPlayers.length > 0) {
            const anyPlayer =
              unassignedPlayers[
                Math.floor(Math.random() * unassignedPlayers.length)
              ];
            assignments[position] = anyPlayer.name;
            const playerIndex = unassignedPlayers.indexOf(anyPlayer);
            unassignedPlayers.splice(playerIndex, 1);
          }
        }
      });

      // Remaining players go to bench - should be everyone NOT selected to play this inning
      const playingPlayerNames = new Set(playingPlayers.map((p) => p.name));
      const benchPlayers = availablePlayers.filter(
        (player) => !playingPlayerNames.has(player.name)
      );

      assignments.bench = benchPlayers.map((player) => player.name);
      allInnings.push(assignments);
    }

    return allInnings;
  };

  // Generate all innings with balanced play time only if game is generated
  if (!isGenerated) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Team Positions
        </h1>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/30">
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {availablePlayers.length === 0
              ? "Select attending players"
              : "Ready to Generate Positions"}
          </h3>
          <p className="text-gray-600">
            {availablePlayers.length === 0
              ? "Choose which players are attending to generate field positions"
              : `Generate game setup for ${availablePlayers.length} players across 7 innings`}
          </p>
        </div>
      </div>
    );
  }

  const allAssignments = generateAllInnings();
  const innings = allAssignments.map((assignments, index) => ({
    inningNumber: index + 1,
    assignments,
  }));

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Team Positions
      </h1>

      {/* Mobile View - Cards per inning */}
      <div className="block lg:hidden space-y-6">
        {innings.map((inning) => (
          <div
            key={inning.inningNumber}
            className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 shadow-md hover:bg-white/70 transition-all duration-200"
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
                  <span className="text-sm font-medium text-[#354d74]">
                    {position}
                  </span>
                  <span className="text-sm text-gray-900">
                    {inning.assignments[position] || "—"}
                  </span>
                </div>
              ))}
              {inning.assignments.bench.length > 0 && (
                <BenchSection
                  players={inning.assignments.bench}
                  inningNumber={inning.inningNumber}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-[#D22237]">
              <th className="px-2 py-2 text-left font-semibold text-white text-sm">
                Position
              </th>
              {innings.map((inning) => (
                <th
                  key={inning.inningNumber}
                  className="px-2 py-2 text-center font-semibold text-white min-w-[80px] text-sm"
                >
                  Inning {inning.inningNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {FIELD_POSITIONS.map((position, index) => (
              <tr
                key={position}
                className={index % 2 === 0 ? "bg-[#354d74]/10" : "bg-white"}
              >
                <td className="px-2 py-2 font-medium text-white bg-[#354d74] text-sm">
                  {position}
                </td>
                {innings.map((inning) => (
                  <td
                    key={`${position}-${inning.inningNumber}`}
                    className="px-2 py-2 text-center text-xs text-[#354d74] font-medium"
                  >
                    {inning.assignments[position] || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-[#354d74] bg-[#354d74]/20">
              <td className="px-2 py-2 font-semibold text-white bg-[#354d74] text-sm">
                Bench
              </td>
              {innings.map((inning) => (
                <td
                  key={`bench-${inning.inningNumber}`}
                  className="px-2 py-2 text-center text-xs"
                >
                  {inning.assignments.bench.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {inning.assignments.bench.map((player, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-[#354d74] text-white px-1 py-0.5 rounded text-xs font-medium"
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
  );
}
