"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import PositionsTable from "./PositionsTable";
import BattingOrder from "./Batting";
import { players } from "./data/players";
import { generateEnhancedBattingOrder, type Player } from "./utils/positionUtils";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize with all players attending by default
  const [attendingPlayers, setAttendingPlayers] = useState<string[]>(
    players.map((player) => player.name)
  );

  const [isGameGenerated, setIsGameGenerated] = useState(false);
  const [battingOrder, setBattingOrder] = useState<string[]>([]);
  const [pitchingOrder, setPitchingOrder] = useState<{ battingPosition: number; batter: string; pitcher: string }[]>([]);
  const [positionAssignments, setPositionAssignments] = useState<any[]>([]);
  const [isAttendanceCollapsed, setIsAttendanceCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Load shared game state from URL parameters
  useEffect(() => {
    const sharedAttendance = searchParams.get("attendance");
    const sharedBattingOrder = searchParams.get("batting");
    const sharedPitchingOrder = searchParams.get("pitching");
    const sharedPositions = searchParams.get("positions");

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

          // Load pitching order if available
          if (sharedPitchingOrder) {
            try {
              const decodedPitchingOrder = JSON.parse(
                decodeURIComponent(sharedPitchingOrder)
              );
              setPitchingOrder(decodedPitchingOrder);
            } catch (error) {
              console.error("Error parsing pitching order:", error);
            }
          }

          // Load position assignments if available
          if (sharedPositions) {
            try {
              const decodedPositions = JSON.parse(
                decodeURIComponent(sharedPositions)
              );
              setPositionAssignments(decodedPositions);
            } catch (error) {
              console.error("Error parsing position assignments:", error);
            }
          }

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
    setPitchingOrder([]);
    setPositionAssignments([]);
    setIsAttendanceCollapsed(false);
  };

  // Share functionality - generates read-only /shared URL with current edited state
  const shareGame = async () => {
    if (!isGameGenerated || battingOrder.length === 0) {
      return;
    }

    const shareData = {
      attendance: encodeURIComponent(JSON.stringify(attendingPlayers)),
      batting: encodeURIComponent(JSON.stringify(battingOrder)),
      pitching: encodeURIComponent(JSON.stringify(pitchingOrder)),
      positions: encodeURIComponent(JSON.stringify(positionAssignments)),
    };

    const shareUrl = `${window.location.origin}/shared?attendance=${shareData.attendance}&batting=${shareData.batting}&pitching=${shareData.pitching}&positions=${shareData.positions}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      // Silent fallback - do nothing if clipboard fails
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const generateGame = () => {
    // Get attending players with proper typing
    const availablePlayers = players.filter((player) =>
      attendingPlayers.includes(player.name)
    ) as Player[];

    if (availablePlayers.length === 0) return;

    // Use our enhanced batting order generation that includes pitching order
    const { battingOrder: newBattingOrder, pitchingOrder: newPitchingOrder } = 
      generateEnhancedBattingOrder(availablePlayers);

    setBattingOrder(newBattingOrder);
    setPitchingOrder(newPitchingOrder);
    setIsGameGenerated(true);
    setIsAttendanceCollapsed(true);
  };

  const resetGame = () => {
    setIsGameGenerated(false);
    setBattingOrder([]);
    setPitchingOrder([]);
    setPositionAssignments([]);
    setIsAttendanceCollapsed(false);
    // Clear URL parameters
    router.push(window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:min-h-screen print:bg-white print:flex print:items-center print:justify-center">
      <div className="bg-[#D22237] shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex justify-center sm:justify-start">
            {/* Ball Busters Logo */}
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
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                      isCopied
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-[#D22237] text-white hover:bg-red-700"
                    }`}
                  >
                    {isCopied ? (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
            <div
              className={`flex items-center justify-between mb-4 ${
                isGameGenerated
                  ? "cursor-pointer hover:bg-gray-50/60 rounded-lg p-2 -m-2 transition-all duration-200"
                  : ""
              }`}
              onClick={
                isGameGenerated
                  ? () => setIsAttendanceCollapsed(!isAttendanceCollapsed)
                  : undefined
              }
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Player Attendance
                </h3>
                <span className="text-sm font-bold text-[#D22237] bg-red-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                  {attendingPlayers.length} / {players.length}
                </span>
              </div>
              {isGameGenerated && (
                <div className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600">
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
                </div>
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
          pitchingOrder={pitchingOrder}
          isGenerated={isGameGenerated}
          onBattingOrderChange={setBattingOrder}
          onPitchingOrderChange={setPitchingOrder}
        />
        <PositionsTable
          attendingPlayers={attendingPlayers}
          isGenerated={isGameGenerated}
          sharedPositions={positionAssignments}
          onPositionsChange={setPositionAssignments}
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
