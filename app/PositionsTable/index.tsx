"use client";

import { players } from "../data/players";

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
    // Convert position back to enum format for comparison
    const positionEnum = Object.keys(POSITION_MAP).find(
      (key) => POSITION_MAP[key] === position
    );

    // Check if position is in playablePositions
    const canPlayFromPlayable = player.playablePositions.some(
      (pos: string) => POSITION_MAP[pos] === position
    );

    // Check if position matches preferred position
    const isPreferredPosition =
      player.preferredPosition !== "none" &&
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

    // Simple round-robin approach: rotate players through playing positions
    for (let inning = 0; inning < totalInnings; inning++) {
      const assignments: InningAssignments = { bench: [] };

      // Calculate starting index for this inning's rotation
      // This ensures different players get to play each inning
      const startIndex = (inning * 5) % totalPlayers; // Rotate by 5 each inning

      // Select 9 players to play this inning
      const playingPlayers: any[] = [];
      for (let i = 0; i < fieldPositions; i++) {
        const playerIndex = (startIndex + i) % totalPlayers;
        playingPlayers.push(availablePlayers[playerIndex]);
      }

      // Assign positions - try to give preferred positions first
      const usedPlayers = new Set<string>();
      const remainingPositions = [...FIELD_POSITIONS];

      // First pass: preferred positions
      playingPlayers.forEach((player) => {
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

      // Second pass: fill remaining positions
      const remainingPlayers = playingPlayers.filter(
        (player) => !usedPlayers.has(player.name)
      );

      remainingPositions.forEach((position, index) => {
        if (index < remainingPlayers.length) {
          const player = remainingPlayers[index];

          // Try to find a player who can play this position
          let assignedPlayer = null;
          for (let i = index; i < remainingPlayers.length; i++) {
            if (canPlayerPlayPosition(remainingPlayers[i], position)) {
              assignedPlayer = remainingPlayers[i];
              // Swap players to maintain order
              [remainingPlayers[index], remainingPlayers[i]] = [
                remainingPlayers[i],
                remainingPlayers[index],
              ];
              break;
            }
          }

          // If no eligible player found, assign the first available player anyway
          if (!assignedPlayer) {
            assignedPlayer = player;
          }

          assignments[position] = assignedPlayer.name;
          usedPlayers.add(assignedPlayer.name);
        }
      });

      // Remaining players go to bench
      const benchPlayers = availablePlayers.filter(
        (player) => !usedPlayers.has(player.name)
      );

      assignments.bench = benchPlayers.map((player) => player.name);
      allInnings.push(assignments);
    }

    return allInnings;
  };

  // Generate all innings with balanced play time only if game is generated
  if (!isGenerated) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Team Positions
        </h1>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Team Positions
      </h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-[#D22237]">
              <th className="px-4 py-3 text-left font-semibold text-white">
                Position
              </th>
              {innings.map((inning) => (
                <th
                  key={inning.inningNumber}
                  className="px-4 py-3 text-center font-semibold text-white min-w-[100px]"
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
                <td className="px-4 py-3 font-medium text-white bg-[#354d74]">
                  {position}
                </td>
                {innings.map((inning) => (
                  <td
                    key={`${position}-${inning.inningNumber}`}
                    className="px-4 py-3 text-center text-sm text-[#354d74] font-medium"
                  >
                    {inning.assignments[position] || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-[#354d74] bg-[#354d74]/20">
              <td className="px-4 py-3 font-semibold text-white bg-[#354d74]">
                Bench
              </td>
              {innings.map((inning) => (
                <td
                  key={`bench-${inning.inningNumber}`}
                  className="px-4 py-3 text-center text-sm"
                >
                  {inning.assignments.bench.length > 0 ? (
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
  );
}
