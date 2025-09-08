"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import PositionsTable from "./PositionsTable";
import BattingOrder from "./Batting";
import { players } from "./data/players";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize with all players attending by default
  const [attendingPlayers, setAttendingPlayers] = useState<string[]>(
    players.map((player) => player.name)
  );

  const [isGameGenerated, setIsGameGenerated] = useState(false);
  const [battingOrder, setBattingOrder] = useState<string[]>([]);
  const [isAttendanceCollapsed, setIsAttendanceCollapsed] = useState(false);

  // Load shared game state from URL parameters
  useEffect(() => {
    const sharedAttendance = searchParams.get("attendance");
    const sharedBattingOrder = searchParams.get("batting");

    if (sharedAttendance && sharedBattingOrder) {
      try {
        const decodedAttendance = JSON.parse(
          decodeURIComponent(sharedAttendance)
        );
        const decodedBattingOrder = JSON.parse(
          decodeURIComponent(sharedBattingOrder)
        );

        // Validate that the shared data contains valid player names
        const validAttendance = decodedAttendance.filter((name: string) =>
          players.some((player) => player.name === name)
        );
        const validBattingOrder = decodedBattingOrder.filter((name: string) =>
          players.some((player) => player.name === name)
        );

        if (validAttendance.length > 0 && validBattingOrder.length > 0) {
          setAttendingPlayers(validAttendance);
          setBattingOrder(validBattingOrder);
          setIsGameGenerated(true);
          setIsAttendanceCollapsed(true);
        }
      } catch (error) {
        console.error("Error parsing shared game data:", error);
      }
    }
  }, [searchParams]);

  const handleAttendanceChange = (playerName: string, isAttending: boolean) => {
    if (isAttending) {
      setAttendingPlayers((prev) => [...prev, playerName]);
    } else {
      setAttendingPlayers((prev) => prev.filter((name) => name !== playerName));
    }
    // Reset game when attendance changes
    setIsGameGenerated(false);
    setBattingOrder([]);
    setIsAttendanceCollapsed(false);
  };

  // Share functionality
  const shareGame = async () => {
    if (!isGameGenerated || battingOrder.length === 0) {
      return;
    }

    const shareData = {
      attendance: encodeURIComponent(JSON.stringify(attendingPlayers)),
      batting: encodeURIComponent(JSON.stringify(battingOrder)),
    };

    const shareUrl = `${window.location.origin}${window.location.pathname}?attendance=${shareData.attendance}&batting=${shareData.batting}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      // Silent fallback - do nothing if clipboard fails
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const generateGame = () => {
    // Generate batting order following M-M-F-M-M-F pattern with wraparound safety
    const availablePlayers = players.filter((player) =>
      attendingPlayers.includes(player.name)
    );

    if (availablePlayers.length === 0) return;

    // Shuffle players within gender groups for randomization
    const males = availablePlayers
      .filter((p) => p.gender === "MALE")
      .sort(() => Math.random() - 0.5);

    const females = availablePlayers
      .filter((p) => p.gender === "FEMALE")
      .sort(() => Math.random() - 0.5);

    // Helper function to check wraparound violations
    const hasWraparoundViolation = (order: string[]): boolean => {
      if (order.length < 2) return false;

      const first = order[0];
      const second = order.length > 1 ? order[1] : null;
      const lastTwo = order.slice(-2);

      const isFirstMale = males.some((m) => m.name === first);
      const isFirstFemale = !isFirstMale;
      const isSecondMale = second
        ? males.some((m) => m.name === second)
        : false;

      // Check if last players would create violations when cycling
      if (lastTwo.length === 2) {
        const isLastMale = males.some((m) => m.name === lastTwo[1]);
        const isSecondLastMale = males.some((m) => m.name === lastTwo[0]);

        // Check for 3 consecutive males with wraparound
        if (isSecondLastMale && isLastMale && isFirstMale) return true;

        // Check for back-to-back females with wraparound
        const isLastFemale = !isLastMale;
        if (isLastFemale && isFirstFemale) return true;
      }

      // Check if last one is male and first two are males (3 in a row)
      if (order.length >= 2) {
        const isLastMale = males.some(
          (m) => m.name === order[order.length - 1]
        );
        if (isLastMale && isFirstMale && isSecondMale) return true;
      }

      return false;
    };

    // Fix wraparound violations by swapping positions
    const fixWraparoundViolation = (order: string[]): string[] | null => {
      if (order.length < 2) return order;

      const fixedOrder = [...order];
      const firstIsFemale = !males.some((m) => m.name === fixedOrder[0]);
      const lastIsFemale = !males.some(
        (m) => m.name === fixedOrder[fixedOrder.length - 1]
      );

      // If we have back-to-back females at wraparound (last and first are both female)
      if (lastIsFemale && firstIsFemale) {
        // Try to find a male to swap with either the first or last position
        for (let i = 1; i < fixedOrder.length - 1; i++) {
          const isMale = males.some((m) => m.name === fixedOrder[i]);

          if (isMale) {
            // Try swapping with the last position first
            const testOrder1 = [...fixedOrder];
            [testOrder1[i], testOrder1[testOrder1.length - 1]] = [
              testOrder1[testOrder1.length - 1],
              testOrder1[i],
            ];

            if (!hasConstraintViolations(testOrder1)) {
              return testOrder1;
            }

            // Try swapping with the first position
            const testOrder2 = [...fixedOrder];
            [testOrder2[i], testOrder2[0]] = [testOrder2[0], testOrder2[i]];

            if (!hasConstraintViolations(testOrder2)) {
              return testOrder2;
            }
          }
        }
      }

      return null; // Could not fix
    };

    // Check for any constraint violations (internal + wraparound)
    const hasConstraintViolations = (order: string[]): boolean => {
      // Check no 3+ consecutive males
      for (let i = 0; i < order.length - 2; i++) {
        const isM1 = males.some((m) => m.name === order[i]);
        const isM2 = males.some((m) => m.name === order[i + 1]);
        const isM3 = males.some((m) => m.name === order[i + 2]);
        if (isM1 && isM2 && isM3) return true;
      }

      // Check no back-to-back females
      for (let i = 0; i < order.length - 1; i++) {
        const isF1 = !males.some((m) => m.name === order[i]);
        const isF2 = !males.some((m) => m.name === order[i + 1]);
        if (isF1 && isF2) return true;
      }

      // Check wraparound violations
      return hasWraparoundViolation(order);
    };

    // Generate batting order using M-M-F pattern with better female distribution
    const generateMMFPattern = (): string[] => {
      const order: string[] = [];
      const remainingMales = [...males];
      const remainingFemales = [...females];

      const totalPlayers = remainingMales.length + remainingFemales.length;
      const maleCount = remainingMales.length;
      const femaleCount = remainingFemales.length;

      // If we have more females than the basic M-M-F pattern can accommodate,
      // we need to distribute them more evenly
      const basicMMFCycles = Math.floor(maleCount / 2); // Each cycle uses 2 males, 1 female
      const femalesInBasicPattern = basicMMFCycles;
      const extraFemales = femaleCount - femalesInBasicPattern;

      // Strategy: Build the order ensuring all players are included
      while (remainingMales.length > 0 || remainingFemales.length > 0) {
        let added = false;

        // Calculate current pattern position preference
        const orderLength = order.length;
        const malesPlaced = order.filter((name) =>
          males.some((m) => m.name === name)
        ).length;
        const femalesPlaced = order.filter((name) =>
          females.some((f) => f.name === name)
        ).length;

        // Determine what we should prefer to add next
        let preferMale = false;

        // Check if we're in a position where M-M-F pattern suggests male
        const positionInCycle = orderLength % 3;
        if (positionInCycle === 0 || positionInCycle === 1) {
          preferMale = true;
        }

        // Override preference if we have too many of one gender remaining
        const remainingMaleCount = remainingMales.length;
        const remainingFemaleCount = remainingFemales.length;
        const remainingTotal = remainingMaleCount + remainingFemaleCount;

        // If we have way more females remaining, prefer female
        if (remainingFemaleCount > remainingMaleCount * 1.5) {
          preferMale = false;
        }
        // If we have way more males remaining, prefer male
        else if (remainingMaleCount > remainingFemaleCount * 2) {
          preferMale = true;
        }

        if (preferMale && remainingMales.length > 0) {
          // Try to add male
          const canAddMale =
            order.length < 2 ||
            !(
              males.some((m) => m.name === order[order.length - 1]) &&
              males.some((m) => m.name === order[order.length - 2])
            );

          if (canAddMale) {
            order.push(remainingMales.shift()!.name);
            added = true;
          }
        }

        if (!added && remainingFemales.length > 0) {
          // Try to add female
          const lastIsFemale =
            order.length > 0 &&
            !males.some((m) => m.name === order[order.length - 1]);

          if (!lastIsFemale) {
            order.push(remainingFemales.shift()!.name);
            added = true;
          }
        }

        // If we couldn't add preferred gender, try the other
        if (!added && remainingMales.length > 0) {
          const canAddMale =
            order.length < 2 ||
            !(
              males.some((m) => m.name === order[order.length - 1]) &&
              males.some((m) => m.name === order[order.length - 2])
            );

          if (canAddMale) {
            order.push(remainingMales.shift()!.name);
            added = true;
          }
        }

        if (!added && remainingFemales.length > 0) {
          // Last resort: add female even if it might break pattern
          // But still respect the no back-to-back female rule
          const lastIsFemale =
            order.length > 0 &&
            !males.some((m) => m.name === order[order.length - 1]);

          if (!lastIsFemale) {
            order.push(remainingFemales.shift()!.name);
            added = true;
          }
        }

        // Safety: if we can't add anyone, we need to backtrack
        if (!added) {
          console.warn("Cannot place remaining players due to constraints:", {
            remainingMales: remainingMales.length,
            remainingFemales: remainingFemales.length,
            currentOrder: order,
          });

          // If we have remaining players and we're stuck, try to backtrack
          // and rearrange to fit everyone
          if (remainingMales.length > 0 || remainingFemales.length > 0) {
            // Try to insert remaining players earlier in the order
            const allRemaining = [...remainingMales, ...remainingFemales];

            for (const player of allRemaining) {
              const isMale = males.some((m) => m.name === player.name);

              // Try to find a valid position to insert this player
              let inserted = false;
              for (let i = 0; i <= order.length && !inserted; i++) {
                const testOrder = [...order];
                testOrder.splice(i, 0, player.name);

                // Check if this insertion violates constraints
                let valid = true;

                // Check no 3+ consecutive males
                for (let j = 0; j < testOrder.length - 2; j++) {
                  const isM1 = males.some((m) => m.name === testOrder[j]);
                  const isM2 = males.some((m) => m.name === testOrder[j + 1]);
                  const isM3 = males.some((m) => m.name === testOrder[j + 2]);
                  if (isM1 && isM2 && isM3) {
                    valid = false;
                    break;
                  }
                }

                // Check no back-to-back females
                if (valid) {
                  for (let j = 0; j < testOrder.length - 1; j++) {
                    const isF1 = !males.some((m) => m.name === testOrder[j]);
                    const isF2 = !males.some(
                      (m) => m.name === testOrder[j + 1]
                    );
                    if (isF1 && isF2) {
                      valid = false;
                      break;
                    }
                  }
                }

                if (valid) {
                  // Replace order contents instead of reassigning
                  order.length = 0;
                  order.push(...testOrder);

                  // Remove this player from remaining arrays
                  if (isMale) {
                    const index = remainingMales.findIndex(
                      (p) => p.name === player.name
                    );
                    if (index >= 0) remainingMales.splice(index, 1);
                  } else {
                    const index = remainingFemales.findIndex(
                      (p) => p.name === player.name
                    );
                    if (index >= 0) remainingFemales.splice(index, 1);
                  }
                  inserted = true;
                  added = true;
                }
              }

              if (inserted) break; // Successfully inserted one, continue main loop
            }
          }

          // If still can't place anyone after backtracking, break
          if (!added) {
            break;
          }
        }
      }

      return order;
    };

    // Generate order with multiple attempts to avoid wraparound violations
    let bestOrder: string[] = [];
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const candidateOrder = generateMMFPattern();

      if (!hasWraparoundViolation(candidateOrder)) {
        bestOrder = candidateOrder;
        break; // Found a valid order
      }

      // If we have a wraparound violation, try to fix it
      if (candidateOrder.length === males.length + females.length) {
        const fixedOrder = fixWraparoundViolation(candidateOrder);
        if (fixedOrder && !hasWraparoundViolation(fixedOrder)) {
          bestOrder = fixedOrder;
          break;
        }
      }

      // Keep the longest valid sequence
      if (candidateOrder.length > bestOrder.length) {
        bestOrder = candidateOrder;
      }

      attempts++;
    }

    setBattingOrder(bestOrder);
    setIsGameGenerated(true);
    setIsAttendanceCollapsed(true);
  };

  const resetGame = () => {
    setIsGameGenerated(false);
    setBattingOrder([]);
    setIsAttendanceCollapsed(false);
    // Clear URL parameters
    router.push(window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:min-h-screen print:bg-white print:flex print:items-center print:justify-center">
      <div className="bg-[#D22237] shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Ball Busters
          </h1>
          <p className="text-red-100 mt-1">Team Management System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 print:py-2 print:space-y-4 print:w-full print:max-w-none print:px-8">
        {/* Game Generation Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4 sm:p-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Game Setup
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Generate batting order and field positions for the game
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:space-y-0">
              {!isGameGenerated ? (
                <button
                  onClick={generateGame}
                  disabled={attendingPlayers.length === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  Generate Game
                </button>
              ) : (
                <>
                  <button
                    onClick={generateGame}
                    className="w-full sm:w-auto px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Regenerate
                  </button>
                  <button
                    onClick={shareGame}
                    className="w-full sm:w-auto px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full sm:w-auto px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Player Attendance Section */}
          <div className="mt-6 border-t border-gray-200/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Player Attendance
                </h3>
                <span className="text-sm font-bold text-[#D22237] bg-red-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                  {attendingPlayers.length} / {players.length}
                </span>
              </div>
              {isGameGenerated && (
                <button
                  onClick={() =>
                    setIsAttendanceCollapsed(!isAttendanceCollapsed)
                  }
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#D22237] hover:bg-red-50/60 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAttendanceCollapsed ? "rotate-0" : "rotate-180"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span>{isAttendanceCollapsed ? "Show" : "Hide"}</span>
                </button>
              )}
            </div>

            {/* Player Grid - Collapsible */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isAttendanceCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-[2000px] opacity-100"
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {players.map((player) => (
                  <label
                    key={player.name}
                    className="group flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 border-white/30 hover:border-[#D22237]/60 transition-all duration-200 bg-white/40 backdrop-blur-sm hover:bg-red-50/60 shadow-md min-w-0"
                  >
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={attendingPlayers.includes(player.name)}
                        onChange={(e) =>
                          handleAttendanceChange(player.name, e.target.checked)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          attendingPlayers.includes(player.name)
                            ? "bg-[#D22237] border-[#D22237]"
                            : "bg-white border-gray-300 group-hover:border-[#D22237]"
                        }`}
                      >
                        {attendingPlayers.includes(player.name) && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 block truncate">
                        {player.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate block">
                        {player.gender === "MALE" ? "Male" : "Female"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BattingOrder
          attendingPlayers={attendingPlayers}
          battingOrder={battingOrder}
          isGenerated={isGameGenerated}
          onBattingOrderChange={setBattingOrder}
        />
        <PositionsTable
          attendingPlayers={attendingPlayers}
          isGenerated={isGameGenerated}
        />
      </div>

      {/* Footer */}
      <footer className="bg-[#D22237] mt-16 print:hidden">
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

export default function Home() {
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
            <p className="text-gray-600">Loading Ball Busters...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
