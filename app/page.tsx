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
  };

  const resetGame = () => {
    setIsGameGenerated(false);
    setBattingOrder([]);
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
        <div className="print:hidden">
          <AttendanceForm
            attendingPlayers={attendingPlayers}
            onAttendanceChange={handleAttendanceChange}
          />
        </div>

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
                  className="w-full sm:w-auto px-6 py-3 bg-[#D22237] text-white rounded-lg hover:bg-red-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Generate Game
                </button>
              ) : (
                <>
                  <button
                    onClick={generateGame}
                    className="w-full sm:w-auto px-4 py-2 bg-[#354d74] text-white rounded-lg hover:bg-[#2a3d5f] hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
