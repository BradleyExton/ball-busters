"use client";

import { players } from "../data/players";
import { useState, useRef, useEffect, useMemo } from "react";
import { 
  generateOptimizedAssignments,
  canPlayerPlayPosition,
  validateAssignments,
  calculatePlayerStats,
  analyzeBenchGenderBalance,
  FIELD_POSITIONS,
  POSITION_MAP,
  type InningAssignments,
  type Player
} from "../utils/positionUtils";

// BenchSection component for mobile view
function BenchSection({
  players,
  inningNumber,
  isEditMode = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  players: string[];
  inningNumber: number;
  isEditMode?: boolean;
  onDragStart?: (
    e: React.DragEvent,
    player: string,
    inning: number,
    position: string
  ) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, inning: number, position: string) => void;
  onDragEnd?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxVisible = 3; // Show max 3 players by default on mobile
  const hasMore = players.length > maxVisible;
  const visiblePlayers = isExpanded ? players : players.slice(0, maxVisible);

  return (
    <div
      className="py-2 px-3 bg-[#354d74]/20 backdrop-blur-sm rounded border border-white/20"
      onDragOver={isEditMode ? onDragOver : undefined}
      onDrop={
        isEditMode ? (e) => onDrop?.(e, inningNumber - 1, "bench") : undefined
      }
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-[#354d74] flex-shrink-0">
          Bench
        </span>
        <div className="flex-1 ml-3">
          <div className="flex flex-wrap gap-1">
            {visiblePlayers.map((player, idx) => (
              <span
                key={idx}
                className={`inline-block bg-[#354d74]/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs shadow-md ${
                  isEditMode ? "cursor-move hover:bg-blue-600" : ""
                }`}
                draggable={isEditMode}
                onDragStart={
                  isEditMode
                    ? (e) => onDragStart?.(e, player, inningNumber - 1, "bench")
                    : undefined
                }
                onDragEnd={isEditMode ? onDragEnd : undefined}
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

interface PositionsTableProps {
  attendingPlayers: string[];
  isGenerated: boolean;
  sharedPositions?: InningAssignments[];
  onPositionsChange?: (positions: InningAssignments[]) => void;
}

export default function PositionsTable({
  attendingPlayers,
  isGenerated,
  sharedPositions = [],
  onPositionsChange,
}: PositionsTableProps) {
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableAssignments, setEditableAssignments] = useState<
    InningAssignments[]
  >([]);
  const [savedAssignments, setSavedAssignments] = useState<InningAssignments[]>(
    []
  );
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [draggedFromPosition, setDraggedFromPosition] = useState<{
    inning: number;
    position: string;
  } | null>(null);

  // Filter players to only include those attending
  const availablePlayers = players.filter((player) =>
    attendingPlayers.includes(player.name)
  );

  // Helper function to check if a player can play a specific position (keeping for backwards compatibility)
  const canPlayerPlayPositionLocal = (player: any, position: string): boolean => {
    // Defensive check for undefined player
    if (!player || !player.playablePositions) {
      console.error(
        "canPlayerPlayPosition called with invalid player:",
        player
      );
      return false;
    }

    return canPlayerPlayPosition(player as Player, position);
  };

  // Generate initial assignments when component mounts or when available players change
  const initialAssignments = useMemo(() => {
    if (availablePlayers.length >= 9) {
      // Use our new optimized algorithm
      return generateOptimizedAssignments(availablePlayers as Player[]);
    }
    return [];
  }, [availablePlayers.length]); // Only regenerate when number of available players changes

  useEffect(() => {
    // Load shared positions if available, otherwise use initial assignments
    if (sharedPositions.length > 0 && savedAssignments.length === 0) {
      setSavedAssignments([...sharedPositions]);
      if (onPositionsChange) {
        onPositionsChange([...sharedPositions]);
      }
    } else if (initialAssignments.length > 0 && savedAssignments.length === 0) {
      setSavedAssignments([...initialAssignments]);
      if (onPositionsChange) {
        onPositionsChange([...initialAssignments]);
      }
    }
  }, [initialAssignments, savedAssignments.length, sharedPositions]);

  // Reset saved assignments when attending players change
  useEffect(() => {
    setSavedAssignments([]);
    setEditableAssignments([]);
    setIsEditMode(false);
  }, [attendingPlayers]);

  // Drag and drop handlers for edit mode
  const handleDragStart = (
    e: React.DragEvent,
    player: string,
    inning: number,
    position: string
  ) => {
    setDraggedPlayer(player);
    setDraggedFromPosition({ inning, position });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetInning: number,
    targetPosition: string
  ) => {
    e.preventDefault();

    if (!draggedPlayer || !draggedFromPosition) return;

    // Create new assignments array
    const newAssignments = [...editableAssignments];

    // Handle bench position specially since it's an array
    if (targetPosition === "bench") {
      // Add dragged player to target bench
      if (!newAssignments[targetInning].bench) {
        newAssignments[targetInning].bench = [];
      }
      newAssignments[targetInning].bench.push(draggedPlayer);

      // Remove dragged player from source position
      if (draggedFromPosition.position === "bench") {
        // Remove from source bench
        const sourceIndex =
          newAssignments[draggedFromPosition.inning].bench.indexOf(
            draggedPlayer
          );
        if (sourceIndex > -1) {
          newAssignments[draggedFromPosition.inning].bench.splice(
            sourceIndex,
            1
          );
        }
      } else {
        // Remove from field position and set to empty
        newAssignments[draggedFromPosition.inning][
          draggedFromPosition.position
        ] = "";
      }
    } else if (draggedFromPosition.position === "bench") {
      // Moving from bench to field position
      const targetPlayer = newAssignments[targetInning][targetPosition];

      // Set dragged player to target field position
      newAssignments[targetInning][targetPosition] = draggedPlayer;

      // Remove dragged player from source bench
      const sourceIndex =
        newAssignments[draggedFromPosition.inning].bench.indexOf(draggedPlayer);
      if (sourceIndex > -1) {
        newAssignments[draggedFromPosition.inning].bench.splice(sourceIndex, 1);
      }

      // If there was a player at target position, move them to source bench
      if (targetPlayer) {
        if (!newAssignments[draggedFromPosition.inning].bench) {
          newAssignments[draggedFromPosition.inning].bench = [];
        }
        // Handle targetPlayer being either string or string array
        const playerToAdd =
          typeof targetPlayer === "string" ? targetPlayer : targetPlayer[0];
        if (playerToAdd) {
          newAssignments[draggedFromPosition.inning].bench.push(playerToAdd);
        }
      }
    } else {
      // Regular field position to field position swap
      const targetPlayer = newAssignments[targetInning][targetPosition];

      // Swap players
      newAssignments[draggedFromPosition.inning][draggedFromPosition.position] =
        targetPlayer || "";
      newAssignments[targetInning][targetPosition] = draggedPlayer;
    }

    setEditableAssignments(newAssignments);
    setDraggedPlayer(null);
    setDraggedFromPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDraggedFromPosition(null);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isEditMode) {
      // Entering edit mode - initialize editable assignments from saved assignments
      if (savedAssignments.length > 0) {
        setEditableAssignments([...savedAssignments]);
      } else if (initialAssignments.length > 0) {
        setSavedAssignments([...initialAssignments]);
        setEditableAssignments([...initialAssignments]);
      }
    }
    setIsEditMode(!isEditMode);
  };

  // Generate assignments for display
  const allAssignments = isEditMode
    ? editableAssignments
    : savedAssignments.length > 0
      ? savedAssignments
      : initialAssignments;

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
      canPlayerPlayPositionLocal(player, position)
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

  const innings = allAssignments.map((assignments, index) => ({
    inningNumber: index + 1,
    assignments,
  }));

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 print:bg-transparent print:shadow-none print:border-none print:rounded-none print:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Team Positions</h1>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <button
                onClick={() => {
                  // Save changes
                  setSavedAssignments([...editableAssignments]);
                  // Notify parent component of changes
                  if (onPositionsChange) {
                    onPositionsChange([...editableAssignments]);
                  }
                  setIsEditMode(false);
                }}
                className="px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-[#B01E31] transition-colors duration-200 flex items-center gap-2"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save
              </button>
              <button
                onClick={() => {
                  // Cancel changes - revert to saved assignments
                  setEditableAssignments([...savedAssignments]);
                  setIsEditMode(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-[#D22237] text-white rounded-lg hover:bg-[#B01E31] transition-colors duration-200 flex items-center gap-2"
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
            </button>
          )}
        </div>
      </div>

      {/* Assignment Statistics */}
      {allAssignments.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Assignment Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const stats = calculatePlayerStats(allAssignments, attendingPlayers);
              const validation = validateAssignments(allAssignments, availablePlayers as Player[]);
              const genderBalance = analyzeBenchGenderBalance(allAssignments, availablePlayers as Player[]);
              
              const benchTurns = stats.map(s => s.benchTurns);
              const minBench = Math.min(...benchTurns);
              const maxBench = Math.max(...benchTurns);
              const benchVariance = maxBench - minBench;
              
              const preferredPositionRate = stats.reduce((sum, s) => sum + (s.playingTurns > 0 ? s.preferredPositionTurns / s.playingTurns : 0), 0) / stats.length;
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{benchVariance}</div>
                    <div className="text-sm text-blue-700">Max Bench Difference</div>
                    <div className="text-xs text-blue-600">Range: {minBench}-{maxBench} turns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{(preferredPositionRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-blue-700">Preferred Position Rate</div>
                    <div className="text-xs text-blue-600">Players in preferred positions</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${genderBalance.isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
                      {genderBalance.isBalanced ? '⚖️' : '⚠️'}
                    </div>
                    <div className="text-sm text-blue-700">Gender Balance</div>
                    <div className="text-xs text-blue-600">
                      {genderBalance.isBalanced ? 'Well balanced' : `${(genderBalance.worstImbalance * 100).toFixed(0)}% deviation`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.isValid ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-blue-700">Constraint Validation</div>
                    <div className="text-xs text-blue-600">
                      {validation.isValid ? 'All constraints met' : `${validation.issues.length} issues`}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Gender Balance Details */}
          {(() => {
            const genderBalance = analyzeBenchGenderBalance(allAssignments, availablePlayers as Player[]);
            const teamMales = availablePlayers.filter(p => (p as any).gender === 'MALE').length;
            const teamFemales = availablePlayers.filter(p => (p as any).gender === 'FEMALE').length;
            
            return (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="text-md font-medium text-blue-800 mb-2">Bench Gender Distribution by Inning</h4>
                <div className="text-xs text-blue-600 mb-2">
                  Team composition: {teamMales} males, {teamFemales} females
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {genderBalance.inningBreakdown.map((inning) => (
                    <div key={inning.inning} className="text-center">
                      <div className="font-medium text-blue-700">Inn {inning.inning}</div>
                      <div className="text-blue-600">
                        {inning.malesOnBench}M / {inning.femalesOnBench}F
                      </div>
                      {inning.totalOnBench > 1 && (
                        <div className={`text-xs ${
                          (inning.malesOnBench === 0 || inning.femalesOnBench === 0) ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {(inning.malesOnBench === 0 || inning.femalesOnBench === 0) ? '⚠️' : '✓'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

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
                  onDragOver={isEditMode ? handleDragOver : undefined}
                  onDrop={
                    isEditMode
                      ? (e) => handleDrop(e, inning.inningNumber - 1, position)
                      : undefined
                  }
                >
                  <span className="text-sm font-medium text-[#354d74]">
                    {position}
                  </span>
                  <span
                    className={`text-sm text-gray-900 ${
                      isEditMode
                        ? "cursor-move bg-blue-100 px-2 py-1 rounded"
                        : ""
                    }`}
                    draggable={isEditMode}
                    onDragStart={
                      isEditMode
                        ? (e) => {
                            const playerName =
                              typeof inning.assignments[position] === "string"
                                ? inning.assignments[position]
                                : inning.assignments[position]?.[0] || "";
                            handleDragStart(
                              e,
                              playerName,
                              inning.inningNumber - 1,
                              position
                            );
                          }
                        : undefined
                    }
                    onDragEnd={isEditMode ? handleDragEnd : undefined}
                  >
                    {inning.assignments[position] || "—"}
                  </span>
                </div>
              ))}
              {inning.assignments.bench.length > 0 && (
                <BenchSection
                  players={inning.assignments.bench}
                  inningNumber={inning.inningNumber}
                  isEditMode={isEditMode}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
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
                    className={`px-2 py-2 text-center text-xs text-[#354d74] font-medium ${
                      isEditMode ? "cursor-move" : ""
                    }`}
                    onDragOver={isEditMode ? handleDragOver : undefined}
                    onDrop={
                      isEditMode
                        ? (e) =>
                            handleDrop(e, inning.inningNumber - 1, position)
                        : undefined
                    }
                  >
                    <span
                      draggable={isEditMode}
                      onDragStart={
                        isEditMode
                          ? (e) => {
                              const playerName =
                                typeof inning.assignments[position] === "string"
                                  ? inning.assignments[position]
                                  : inning.assignments[position]?.[0] || "";
                              handleDragStart(
                                e,
                                playerName,
                                inning.inningNumber - 1,
                                position
                              );
                            }
                          : undefined
                      }
                      onDragEnd={isEditMode ? handleDragEnd : undefined}
                      className={
                        isEditMode ? "bg-blue-100 px-2 py-1 rounded" : ""
                      }
                    >
                      {inning.assignments[position] || (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </span>
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
                  className={`px-2 py-2 text-center text-xs ${
                    isEditMode ? "cursor-move" : ""
                  }`}
                  onDragOver={isEditMode ? handleDragOver : undefined}
                  onDrop={
                    isEditMode
                      ? (e) => handleDrop(e, inning.inningNumber - 1, "bench")
                      : undefined
                  }
                >
                  {inning.assignments.bench.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {inning.assignments.bench.map((player, idx) => (
                        <span
                          key={idx}
                          className={`inline-block bg-[#354d74] text-white px-1 py-0.5 rounded text-xs font-medium ${
                            isEditMode ? "cursor-move hover:bg-blue-600" : ""
                          }`}
                          draggable={isEditMode}
                          onDragStart={
                            isEditMode
                              ? (e) =>
                                  handleDragStart(
                                    e,
                                    player,
                                    inning.inningNumber - 1,
                                    "bench"
                                  )
                              : undefined
                          }
                          onDragEnd={isEditMode ? handleDragEnd : undefined}
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
