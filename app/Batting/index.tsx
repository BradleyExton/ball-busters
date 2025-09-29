"use client";

import { useState, useEffect, useRef } from "react";
import { players } from "../data/players";
import { generatePitchingOrder, type Player } from "../utils/positionUtils";

interface BattingOrderProps {
  attendingPlayers: string[];
  battingOrder: string[];
  pitchingOrder: { battingPosition: number; batter: string; pitcher: string }[];
  isGenerated: boolean;
  onBattingOrderChange: (newOrder: string[]) => void;
  onPitchingOrderChange?: (newPitchingOrder: { battingPosition: number; batter: string; pitcher: string }[]) => void;
}

export default function BattingOrder({
  attendingPlayers,
  battingOrder,
  pitchingOrder,
  isGenerated,
  onBattingOrderChange,
  onPitchingOrderChange,
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

  // Helper functions for pitching information
  const getPitcherForBattingPosition = (battingPosition: number): string | null => {
    const pitchingAssignment = pitchingOrder.find(p => p.battingPosition === battingPosition);
    return pitchingAssignment ? pitchingAssignment.pitcher : null;
  };

  const getPitcherPriority = (pitcherName: string): number => {
    const pitcher = players.find(p => p.name === pitcherName);
    return pitcher?.pitchingPriority || 0;
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return "Primary";
      case 2: return "Secondary"; 
      case 3: return "Tertiary";
      default: return "Emergency";
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200";
      case 3: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  // Helper function to detect violations of the M-M-F pattern rules
  const hasConsecutiveMalesViolation = (index: number): boolean => {
    if (battingOrder.length === 0) return false;

    const currentGender = getPlayerGender(battingOrder[index]);
    if (currentGender !== "M") return false;

    // Count consecutive males including this position (considering wraparound)
    let consecutiveMales = 1;

    // Count males before this position (going backwards with wraparound)
    let checkIndex = (index - 1 + battingOrder.length) % battingOrder.length;
    while (
      checkIndex !== index &&
      getPlayerGender(battingOrder[checkIndex]) === "M"
    ) {
      consecutiveMales++;
      checkIndex = (checkIndex - 1 + battingOrder.length) % battingOrder.length;
      if (consecutiveMales > 3) break; // Prevent infinite loop
    }

    // Count males after this position (going forwards with wraparound)
    checkIndex = (index + 1) % battingOrder.length;
    while (
      checkIndex !== index &&
      getPlayerGender(battingOrder[checkIndex]) === "M"
    ) {
      consecutiveMales++;
      checkIndex = (checkIndex + 1) % battingOrder.length;
      if (consecutiveMales > 3) break; // Prevent infinite loop
    }

    return consecutiveMales > 2;
  };

  // Helper function to detect back-to-back females
  const hasConsecutiveFemalesViolation = (index: number): boolean => {
    if (battingOrder.length === 0) return false;

    const currentGender = getPlayerGender(battingOrder[index]);
    if (currentGender !== "F") return false;

    // Check if this female is part of a back-to-back sequence (considering wraparound)
    const prevIndex = (index - 1 + battingOrder.length) % battingOrder.length;
    const nextIndex = (index + 1) % battingOrder.length;

    // Check if previous player is female (back-to-back)
    if (
      prevIndex !== index &&
      getPlayerGender(battingOrder[prevIndex]) === "F"
    ) {
      return true;
    }

    // Check if next player is female (back-to-back)
    if (
      nextIndex !== index &&
      getPlayerGender(battingOrder[nextIndex]) === "F"
    ) {
      return true;
    }

    return false;
  };

  // Check if the overall batting order has any violations
  const hasAnyViolations = (): boolean => {
    for (let i = 0; i < battingOrder.length; i++) {
      if (
        hasConsecutiveMalesViolation(i) ||
        hasConsecutiveFemalesViolation(i)
      ) {
        return true;
      }
    }
    return false;
  };

  // Drag and drop functionality
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRulesCollapsed, setIsRulesCollapsed] = useState(true);

  // Ref for rules container to detect outside clicks
  const rulesRef = useRef<HTMLDivElement>(null);

  // Handle outside click to collapse rules
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rulesRef.current &&
        !rulesRef.current.contains(event.target as Node)
      ) {
        setIsRulesCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...battingOrder];
    const draggedPlayer = newOrder[draggedIndex];

    // Remove the dragged player from its original position
    newOrder.splice(draggedIndex, 1);

    // Insert the dragged player at the new position
    newOrder.splice(dropIndex, 0, draggedPlayer);

    onBattingOrderChange(newOrder);

    // Regenerate pitching order based on new batting order
    if (onPitchingOrderChange) {
      const newPitchingOrder = generatePitchingOrder(newOrder, availablePlayers as Player[]);
      onPitchingOrderChange(newPitchingOrder);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (availablePlayers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Batting Order & Pitching
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Batting sequence and pitching assignments for each inning
        </p>
        <div className="text-center py-8 text-gray-500">
          <p>Select attending players to generate batting order and pitching schedule</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Team Pitchers</h4>
            <div className="text-sm text-blue-700">
              <p><strong>Primary:</strong> Darren</p>
              <p><strong>Secondary:</strong> Ryan</p>
              <p><strong>Tertiary:</strong> Kenny</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Batting Order & Pitching
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Batting sequence and pitching assignments for each inning
            </p>
          </div>
          {isGenerated && battingOrder.length > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 print:hidden shadow-md hover:shadow-lg hover:scale-105 active:scale-95 bg-[#D22237] text-white hover:bg-red-700 cursor-pointer"
            >
              {isEditMode ? (
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
                  Done
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isGenerated && battingOrder.length > 0 ? (
        <div>
          {/* Mobile View - Cards */}
          <div className="block md:hidden print:hidden space-y-2">
            {battingOrder.map((playerName, index) => {
              const hasMaleViolation = hasConsecutiveMalesViolation(index);
              const hasFemaleViolation = hasConsecutiveFemalesViolation(index);
              const hasAnyViolation = hasMaleViolation || hasFemaleViolation;
              
              // Get pitcher information for this batting position
              const battingPosition = index + 1;
              const pitcher = getPitcherForBattingPosition(battingPosition);
              const cleanPitcher = pitcher?.replace(" (Emergency)", "") || "";
              const priority = cleanPitcher ? getPitcherPriority(cleanPitcher) : 0;
              const isEmergency = pitcher?.includes("(Emergency)") || false;

              return (
                <div
                  key={`${playerName}-${index}`}
                  draggable={isEditMode}
                  onDragStart={
                    isEditMode ? (e) => handleDragStart(e, index) : undefined
                  }
                  onDragOver={isEditMode ? handleDragOver : undefined}
                  onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
                  onDragEnd={isEditMode ? handleDragEnd : undefined}
                  className={`p-3 backdrop-blur-sm rounded-lg border shadow-md hover:bg-white/70 transition-all duration-200 ${
                    isEditMode ? "cursor-move" : "cursor-default"
                  } ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
                    hasAnyViolation
                      ? "bg-red-100/80 border-red-300 hover:bg-red-100/90"
                      : "bg-white/60 border-white/30"
                  }`}
                >
                  {/* Batter Information */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {isEditMode && (
                        <svg
                          className="w-4 h-4 text-gray-400 cursor-move"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      )}
                      <div
                        className={`flex items-center justify-center w-6 h-6 backdrop-blur-sm text-white rounded-full font-bold text-xs shadow-lg ${
                          hasAnyViolation ? "bg-red-500" : "bg-[#D22237]/90"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {playerName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({getPlayerGender(playerName)})
                        </span>
                        {hasMaleViolation && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            ⚠️ 3+ Males
                          </span>
                        )}
                        {hasFemaleViolation && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            ⚠️ Back-to-back F
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pitcher Information */}
                  {pitcher && (
                    <div className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                      <span className="text-gray-600">Pitcher:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${isEmergency ? 'text-red-600' : 'text-gray-900'}`}>
                          {cleanPitcher}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          isEmergency ? 'bg-red-100 text-red-800 border-red-200' : getPriorityColor(priority)
                        }`}>
                          {isEmergency ? 'Emergency' : getPriorityLabel(priority)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile View - Enhanced with Pitching Info */}

          {/* Desktop View - Table */}
          <div className="hidden md:block print:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D22237]">
                  <th
                    className={`py-2 text-center font-semibold text-white text-sm ${
                      battingOrder.length > 9 ? "px-1" : "px-2"
                    }`}
                  >
                    Position
                  </th>
                  {battingOrder.map((_, index) => (
                    <th
                      key={index}
                      className={`py-2 text-center font-semibold text-white min-w-[60px] text-sm ${
                        battingOrder.length > 9 ? "px-0.5" : "px-1"
                      }`}
                    >
                      {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td
                    className={`py-2 font-medium text-white bg-[#354d74] text-sm ${
                      battingOrder.length > 9 ? "px-1" : "px-2"
                    }`}
                  >
                    Player
                  </td>
                  {battingOrder.map((playerName, index) => {
                    const hasMaleViolation =
                      hasConsecutiveMalesViolation(index);
                    const hasFemaleViolation =
                      hasConsecutiveFemalesViolation(index);
                    const hasAnyViolation =
                      hasMaleViolation || hasFemaleViolation;

                    return (
                      <td
                        key={`${playerName}-${index}`}
                        draggable={isEditMode}
                        onDragStart={
                          isEditMode
                            ? (e) => handleDragStart(e, index)
                            : undefined
                        }
                        onDragOver={isEditMode ? handleDragOver : undefined}
                        onDrop={
                          isEditMode ? (e) => handleDrop(e, index) : undefined
                        }
                        onDragEnd={isEditMode ? handleDragEnd : undefined}
                        className={`py-2 text-center text-xs font-medium ${
                          isEditMode ? "cursor-move" : "cursor-default"
                        } ${battingOrder.length > 9 ? "px-0.5" : "px-1"} ${
                          draggedIndex === index ? "opacity-50 scale-95" : ""
                        } ${
                          hasAnyViolation
                            ? "bg-red-100 text-red-800"
                            : "text-[#354d74]"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {isEditMode && (
                            <svg
                              className="w-3 h-3 text-gray-400 mb-1 cursor-move"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          )}
                          <span className="font-medium text-xs leading-tight">
                            {playerName}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            ({getPlayerGender(playerName)})
                          </span>
                          {(hasMaleViolation || hasFemaleViolation) && (
                            <span className="text-xs text-red-600 font-medium mt-1">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {/* Pitching Row */}
                <tr className="bg-[#354d74]/10">
                  <td
                    className={`py-2 font-medium text-white bg-[#354d74] text-sm ${
                      battingOrder.length > 9 ? "px-1" : "px-2"
                    }`}
                  >
                    Pitcher
                  </td>
                  {battingOrder.map((_, battingIndex) => {
                    const battingPosition = battingIndex + 1;
                    const pitcher = getPitcherForBattingPosition(battingPosition);
                    const cleanPitcher = pitcher?.replace(" (Emergency)", "") || "";
                    const priority = cleanPitcher ? getPitcherPriority(cleanPitcher) : 0;
                    const isEmergency = pitcher?.includes("(Emergency)") || false;
                    
                    return (
                      <td
                        key={`pitcher-${battingPosition}`}
                        className={`py-2 text-center text-xs font-medium ${
                          battingOrder.length > 9 ? "px-0.5" : "px-1"
                        } text-[#354d74]`}
                      >
                        {pitcher ? (
                          <div className="flex flex-col items-center">
                            <span className={`font-medium text-xs leading-tight ${isEmergency ? 'text-red-600' : ''}`}>
                              {cleanPitcher}
                            </span>
                            <span className={`text-xs px-1 py-0.5 rounded mt-1 ${
                              isEmergency ? 'bg-red-100 text-red-800 border-red-200' : getPriorityColor(priority)
                            }`}>
                              {isEmergency ? 'Emergency' : getPriorityLabel(priority)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3">
            <div
              ref={rulesRef}
              className="p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50 print:hidden cursor-pointer"
              onClick={() => setIsRulesCollapsed(!isRulesCollapsed)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Batting Order Rules
                    </h4>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isRulesCollapsed
                          ? "max-h-0 opacity-0"
                          : "max-h-32 opacity-100"
                      }`}
                    >
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>
                          • <strong>Priority Rule:</strong> No back-to-back
                          females (overrides pattern)
                        </li>
                        <li>
                          • <strong>Preferred Pattern:</strong>{" "}
                          M-M-F-M-M-F-M-M-F when possible
                        </li>
                        <li>
                          • <strong>Male Rule:</strong> Maximum 2 males can bat
                          consecutively
                        </li>
                        <li>
                          • <strong>Wraparound:</strong> All rules apply when
                          order cycles back to beginning
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRulesCollapsed(!isRulesCollapsed);
                  }}
                  className="flex-shrink-0 ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                  title={isRulesCollapsed ? "Show rules" : "Hide rules"}
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isRulesCollapsed ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              </div>
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
              : "Ready to Generate Batting Order & Pitching"}
          </h3>
          <p className="text-gray-600">
            {availablePlayers.length === 0
              ? "Choose which players are attending to generate batting order and pitching schedule"
              : `Generate batting order and pitching assignments for ${availablePlayers.length} players`}
          </p>
        </div>
      )}
    </div>
  );
}
