"use client";

import { useState } from "react";
import { players } from "../data/players";

interface BattingOrderProps {
  attendingPlayers: string[];
  battingOrder: string[];
  isGenerated: boolean;
  onBattingOrderChange: (newOrder: string[]) => void;
}

export default function BattingOrder({
  attendingPlayers,
  battingOrder,
  isGenerated,
  onBattingOrderChange,
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
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (availablePlayers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
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
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Batting Order
          </h2>
          {isGenerated && battingOrder.length > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 print:hidden ${
                isEditMode
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
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
                  className={`flex items-center justify-between p-3 backdrop-blur-sm rounded-lg border shadow-md hover:bg-white/70 transition-all duration-200 ${
                    isEditMode ? "cursor-move" : "cursor-default"
                  } ${draggedIndex === index ? "opacity-50 scale-95" : ""} ${
                    hasAnyViolation
                      ? "bg-red-100/80 border-red-300 hover:bg-red-100/90"
                      : "bg-white/60 border-white/30"
                  }`}
                >
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
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block print:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#D22237]">
                  <th
                    className={`py-2 text-center font-semibold text-white text-sm ${
                      battingOrder.length > 11 ? "px-2" : "px-3"
                    }`}
                  >
                    Position
                  </th>
                  {battingOrder.map((_, index) => (
                    <th
                      key={index}
                      className={`py-2 text-center font-semibold text-white min-w-[80px] text-sm ${
                        battingOrder.length > 11 ? "px-1" : "px-2"
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
                      battingOrder.length > 11 ? "px-2" : "px-3"
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
                        } ${battingOrder.length > 11 ? "px-1" : "px-2"} ${
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
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 shadow-md print:hidden">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#354d74] font-medium">
                  Total Batters: {battingOrder.length}
                </div>
                {hasAnyViolations() && (
                  <div className="text-sm text-red-600 font-medium flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Rule Violations Detected
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50 print:hidden">
              <div className="flex items-start space-x-2">
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
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Batting Order Rules
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>
                      • <strong>Priority Rule:</strong> No back-to-back females
                      (overrides pattern)
                    </li>
                    <li>
                      • <strong>Preferred Pattern:</strong> M-M-F-M-M-F-M-M-F
                      when possible
                    </li>
                    <li>
                      • <strong>Male Rule:</strong> Maximum 2 males can bat
                      consecutively
                    </li>
                    <li>
                      • <strong>Wraparound:</strong> All rules apply when order
                      cycles back to beginning
                    </li>
                  </ul>
                </div>
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
