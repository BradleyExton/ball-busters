import { players, POSITIONS } from '../data/players';

export interface Player {
  name: string;
  preferredPosition: string | typeof POSITIONS[keyof typeof POSITIONS];
  playablePositions: (typeof POSITIONS[keyof typeof POSITIONS])[];
  gender: string;
  hittingDistance: number;
  runningSpeed: number;
  pitchingPriority: number; // 0 = not a pitcher, 1 = primary, 2 = secondary, 3 = tertiary
}

export interface InningAssignments {
  [position: string]: string | string[];
  bench: string[];
}

export interface PlayerStats {
  name: string;
  benchTurns: number;
  playingTurns: number;
  preferredPositionTurns: number;
  totalTurns: number;
}

// Position mapping for display
export const POSITION_MAP: { [key: string]: string } = {
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

export const FIELD_POSITIONS = [
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

/**
 * Check if a player can play a specific position
 * A player can play a position if:
 * 1. It's their preferred position, OR
 * 2. It's in their playablePositions array
 */
export function canPlayerPlayPosition(player: Player, position: string): boolean {
  if (!player) {
    return false;
  }

  // Check if position matches preferred position (only if not "none")
  const isPreferred =
    player.preferredPosition !== "none" &&
    player.preferredPosition !== null &&
    (POSITION_MAP[player.preferredPosition] === position ||
      player.preferredPosition === position);

  // Check if position is in playablePositions
  const canPlayFromPlayable = player.playablePositions && player.playablePositions.some(
    (pos: string) => POSITION_MAP[pos] === position
  );

  return isPreferred || canPlayFromPlayable;
}

/**
 * Check if a position is a player's preferred position
 */
export function isPreferredPosition(player: Player, position: string): boolean {
  return (
    player.preferredPosition !== "none" &&
    player.preferredPosition !== null &&
    (POSITION_MAP[player.preferredPosition] === position ||
      player.preferredPosition === position)
  );
}

/**
 * Calculate player statistics across all innings
 */
export function calculatePlayerStats(
  assignments: InningAssignments[],
  playerNames: string[]
): PlayerStats[] {
  const stats: PlayerStats[] = playerNames.map(name => ({
    name,
    benchTurns: 0,
    playingTurns: 0,
    preferredPositionTurns: 0,
    totalTurns: assignments.length,
  }));

  assignments.forEach(inning => {
    // Count bench turns
    inning.bench.forEach(playerName => {
      const playerStat = stats.find(s => s.name === playerName);
      if (playerStat) {
        playerStat.benchTurns++;
      }
    });

    // Count playing turns and preferred position turns
    FIELD_POSITIONS.forEach(position => {
      const playerName = inning[position];
      if (playerName) {
        const playerStat = stats.find(s => s.name === playerName);
        const player = players.find(p => p.name === playerName);
        
        if (playerStat) {
          playerStat.playingTurns++;
          
          if (player && isPreferredPosition(player, position)) {
            playerStat.preferredPositionTurns++;
          }
        }
      }
    });
  });

  return stats;
}

/**
 * Analyze gender balance on the bench across all innings
 */
export function analyzeBenchGenderBalance(
  assignments: InningAssignments[],
  attendingPlayers: Player[]
): {
  averageMaleRatio: number;
  averageFemaleRatio: number;
  inningBreakdown: Array<{
    inning: number;
    malesOnBench: number;
    femalesOnBench: number;
    totalOnBench: number;
    maleRatio: number;
    femaleRatio: number;
  }>;
  isBalanced: boolean;
  worstImbalance: number;
} {
  const inningBreakdown = assignments.map((assignment, index) => {
    const benchPlayers = assignment.bench.map(name => 
      attendingPlayers.find(p => p.name === name)
    ).filter(Boolean) as Player[];
    
    const malesOnBench = benchPlayers.filter(p => p.gender === 'MALE').length;
    const femalesOnBench = benchPlayers.filter(p => p.gender === 'FEMALE').length;
    const totalOnBench = benchPlayers.length;
    
    return {
      inning: index + 1,
      malesOnBench,
      femalesOnBench,
      totalOnBench,
      maleRatio: totalOnBench > 0 ? malesOnBench / totalOnBench : 0,
      femaleRatio: totalOnBench > 0 ? femalesOnBench / totalOnBench : 0,
    };
  });

  const averageMaleRatio = inningBreakdown.reduce((sum, inning) => 
    sum + inning.maleRatio, 0) / inningBreakdown.length;
  const averageFemaleRatio = inningBreakdown.reduce((sum, inning) => 
    sum + inning.femaleRatio, 0) / inningBreakdown.length;

  // Calculate overall team gender ratio
  const totalMales = attendingPlayers.filter(p => p.gender === 'MALE').length;
  const totalFemales = attendingPlayers.filter(p => p.gender === 'FEMALE').length;
  const teamMaleRatio = totalMales / attendingPlayers.length;
  const teamFemaleRatio = totalFemales / attendingPlayers.length;

  // Find worst imbalance (deviation from team ratio)
  const worstImbalance = Math.max(
    ...inningBreakdown.map(inning => 
      Math.abs(inning.maleRatio - teamMaleRatio) + Math.abs(inning.femaleRatio - teamFemaleRatio)
    )
  );

  // Consider balanced if no inning deviates more than 50% from team ratio
  const isBalanced = worstImbalance < 0.5;

  return {
    averageMaleRatio,
    averageFemaleRatio,
    inningBreakdown,
    isBalanced,
    worstImbalance,
  };
}

/**
 * Generate improved position assignments following all rules:
 * 1. Players must play preferred position when available, otherwise only playable positions
 * 2. Players should have equal bench time that is evenly spaced out
 * 3. At least 3 women must be on the field during an inning
 * 4. Benched players should be from both genders and well balanced
 */
export function generateOptimizedAssignments(
  attendingPlayers: Player[],
  totalInnings: number = 7
): InningAssignments[] {
  const assignments: InningAssignments[] = [];
  const playerNames = attendingPlayers.map(p => p.name);

  // Track player statistics throughout the game
  const playerStats = new Map<string, {
    benchTurns: number;
    playingTurns: number;
    preferredPositionTurns: number;
    lastBenchInning: number;
  }>();

  // Initialize player stats
  playerNames.forEach(name => {
    playerStats.set(name, {
      benchTurns: 0,
      playingTurns: 0,
      preferredPositionTurns: 0,
      lastBenchInning: -1,
    });
  });

  // Count women available
  const femaleCount = attendingPlayers.filter(p => p.gender === 'FEMALE').length;
  const maleCount = attendingPlayers.filter(p => p.gender === 'MALE').length;
  const minWomenOnField = Math.min(3, femaleCount); // At least 3 women on field, or all available if less than 3

  for (let inning = 0; inning < totalInnings; inning++) {
    const inningAssignments: InningAssignments = { bench: [] };
    const availableForPlaying = new Set(playerNames);

    // Determine how many players should be benched this inning
    const totalPlayersNeedingBench = Math.max(0, attendingPlayers.length - 9);

    if (totalPlayersNeedingBench > 0) {
      // Minimum females on field constraint means maximum females on bench
      const maxFemalesOnBench = femaleCount - minWomenOnField;

      // Sort ALL players by bench priority (fewest bench turns, then longest since last bench)
      // This creates a unified priority list across all players
      const allPlayersPriority = attendingPlayers
        .map(player => {
          const stats = playerStats.get(player.name)!;
          return {
            name: player.name,
            gender: player.gender,
            benchTurns: stats.benchTurns,
            inningsSinceLastBench: inning - stats.lastBenchInning,
          };
        })
        .sort((a, b) => {
          // Primary: fewest bench turns first (absolute fairness)
          if (a.benchTurns !== b.benchTurns) {
            return a.benchTurns - b.benchTurns;
          }
          // Secondary: longest time since last bench (space it out)
          return b.inningsSinceLastBench - a.inningsSinceLastBench;
        });

      // Select players for bench while respecting gender constraints
      const selectedForBench: string[] = [];
      let femalesOnBench = 0;
      let malesOnBench = 0;

      for (const player of allPlayersPriority) {
        if (selectedForBench.length >= totalPlayersNeedingBench) {
          break;
        }

        const isFemale = player.gender === 'FEMALE';
        const remainingSlots = totalPlayersNeedingBench - selectedForBench.length;

        // Check if we can bench this player without violating constraints
        if (isFemale) {
          // Can we bench another female without dropping below minimum on field?
          if (femalesOnBench < maxFemalesOnBench) {
            selectedForBench.push(player.name);
            femalesOnBench++;
          } else {
            // Skip this female, need to keep her on field
            continue;
          }
        } else {
          // Male player - always OK to bench if we have slots
          selectedForBench.push(player.name);
          malesOnBench++;
        }
      }

      // Ensure both genders represented on bench when possible (bench > 1 player)
      if (selectedForBench.length > 1 && maleCount > 0 && femaleCount > 0) {
        if (malesOnBench === 0 && femalesOnBench > 1) {
          // Replace one female with the lowest-benched male
          const femaleToReplace = selectedForBench.find(name =>
            attendingPlayers.find(p => p.name === name)?.gender === 'FEMALE'
          );
          const maleToAdd = allPlayersPriority.find(p =>
            p.gender === 'MALE' && !selectedForBench.includes(p.name)
          );
          if (femaleToReplace && maleToAdd) {
            const index = selectedForBench.indexOf(femaleToReplace);
            selectedForBench[index] = maleToAdd.name;
            femalesOnBench--;
            malesOnBench++;
          }
        } else if (femalesOnBench === 0 && malesOnBench > 1 && femalesOnBench < maxFemalesOnBench) {
          // Replace one male with the lowest-benched female
          const maleToReplace = selectedForBench.find(name =>
            attendingPlayers.find(p => p.name === name)?.gender === 'MALE'
          );
          const femaleToAdd = allPlayersPriority.find(p =>
            p.gender === 'FEMALE' && !selectedForBench.includes(p.name)
          );
          if (maleToReplace && femaleToAdd) {
            const index = selectedForBench.indexOf(maleToReplace);
            selectedForBench[index] = femaleToAdd.name;
            malesOnBench--;
            femalesOnBench++;
          }
        }
      }

      // Assign benched players
      for (const playerName of selectedForBench) {
        availableForPlaying.delete(playerName);
        inningAssignments.bench.push(playerName);

        const stats = playerStats.get(playerName)!;
        stats.benchTurns++;
        stats.lastBenchInning = inning;
      }
    }

    // Assign field positions with strict constraints
    const unassignedPositions = [...FIELD_POSITIONS];
    const playingPlayers = attendingPlayers.filter(p => availableForPlaying.has(p.name));

    // Count females playing to ensure we meet minimum requirement
    const femalesPlaying = playingPlayers.filter(p => p.gender === 'FEMALE');
    const femalesPlayingCount = femalesPlaying.length;

    if (femalesPlayingCount < minWomenOnField) {
      console.error(`ERROR: Only ${femalesPlayingCount} women available to play, need ${minWomenOnField}`);
    }

    // Phase 1: Assign players to their preferred positions if available
    const playersToAssign = [...playingPlayers];

    for (let i = playersToAssign.length - 1; i >= 0; i--) {
      const player = playersToAssign[i];

      // Skip if player has no preferred position
      if (player.preferredPosition === "none" || !player.preferredPosition) {
        continue;
      }

      const preferredDisplayPosition = POSITION_MAP[player.preferredPosition] || player.preferredPosition;

      // Check if preferred position is available and player can play it
      if (
        unassignedPositions.includes(preferredDisplayPosition) &&
        isPreferredPosition(player, preferredDisplayPosition)
      ) {
        inningAssignments[preferredDisplayPosition] = player.name;
        unassignedPositions.splice(unassignedPositions.indexOf(preferredDisplayPosition), 1);
        playersToAssign.splice(i, 1);

        // Update stats
        const stats = playerStats.get(player.name)!;
        stats.playingTurns++;
        stats.preferredPositionTurns++;
      }
    }

    // Phase 2: Assign remaining players to their playable positions
    const assignedPositions = [...unassignedPositions];
    for (const position of assignedPositions) {
      if (!unassignedPositions.includes(position)) continue; // Already assigned

      // Find players who can play this position
      const eligiblePlayers = playersToAssign
        .filter(player => canPlayerPlayPosition(player, position));

      if (eligiblePlayers.length > 0) {
        // Sort by playing turns to balance playing time
        eligiblePlayers.sort((a, b) => {
          const aStats = playerStats.get(a.name)!;
          const bStats = playerStats.get(b.name)!;
          return aStats.playingTurns - bStats.playingTurns;
        });

        const selectedPlayer = eligiblePlayers[0];
        inningAssignments[position] = selectedPlayer.name;

        // Remove from unassigned lists
        const positionIndex = unassignedPositions.indexOf(position);
        if (positionIndex > -1) {
          unassignedPositions.splice(positionIndex, 1);
        }

        const playerIndex = playersToAssign.indexOf(selectedPlayer);
        if (playerIndex > -1) {
          playersToAssign.splice(playerIndex, 1);
        }

        // Update stats
        const stats = playerStats.get(selectedPlayer.name)!;
        stats.playingTurns++;
      } else {
        // No eligible players for this position in remaining pool
        // Try to find a swap with an already assigned player
        let swapMade = false;

        for (const alreadyAssignedPos of FIELD_POSITIONS) {
          if (unassignedPositions.includes(alreadyAssignedPos)) continue;

          const assignedPlayerName = inningAssignments[alreadyAssignedPos];
          if (!assignedPlayerName || typeof assignedPlayerName !== 'string') continue;

          const assignedPlayer = attendingPlayers.find(p => p.name === assignedPlayerName);
          if (!assignedPlayer) continue;

          // Can the already-assigned player play this position?
          if (canPlayerPlayPosition(assignedPlayer, position)) {
            // Can any remaining player play the assigned player's current position?
            const replacementPlayer = playersToAssign.find(p =>
              canPlayerPlayPosition(p, alreadyAssignedPos)
            );

            if (replacementPlayer) {
              // Make the swap
              inningAssignments[position] = assignedPlayerName;
              inningAssignments[alreadyAssignedPos] = replacementPlayer.name;

              unassignedPositions.splice(unassignedPositions.indexOf(position), 1);
              playersToAssign.splice(playersToAssign.indexOf(replacementPlayer), 1);

              const stats = playerStats.get(replacementPlayer.name)!;
              stats.playingTurns++;

              swapMade = true;
              break;
            }
          }
        }

        if (!swapMade) {
          console.warn(`Phase 2: No eligible players for ${position} in inning ${inning + 1}`);
        }
      }
    }

    // Phase 3: Emergency fallback - try to swap players to avoid invalid assignments
    // Look for opportunities to swap players between positions to respect constraints
    if (unassignedPositions.length > 0 && playersToAssign.length > 0) {
      console.warn(`WARNING Inning ${inning + 1}: ${unassignedPositions.length} positions unassigned, attempting swaps`);

      // Try to find swaps: if an assigned player can play an unassigned position,
      // and an unassigned player can play that assigned player's current position
      for (const unassignedPos of [...unassignedPositions]) {
        let swapFound = false;

        // Look through currently assigned players
        for (const assignedPos of FIELD_POSITIONS) {
          if (unassignedPositions.includes(assignedPos)) continue;

          const assignedPlayerName = inningAssignments[assignedPos];
          if (!assignedPlayerName || typeof assignedPlayerName !== 'string') continue;

          const assignedPlayer = attendingPlayers.find(p => p.name === assignedPlayerName);
          if (!assignedPlayer) continue;

          // Can the assigned player play the unassigned position?
          if (canPlayerPlayPosition(assignedPlayer, unassignedPos)) {
            // Can any unassigned player play the assigned player's current position?
            for (const unassignedPlayer of playersToAssign) {
              if (canPlayerPlayPosition(unassignedPlayer, assignedPos)) {
                // Perform the swap
                console.log(`Swapping: ${assignedPlayerName} (${assignedPos} -> ${unassignedPos}), ${unassignedPlayer.name} (bench -> ${assignedPos})`);
                inningAssignments[unassignedPos] = assignedPlayerName;
                inningAssignments[assignedPos] = unassignedPlayer.name;

                unassignedPositions.splice(unassignedPositions.indexOf(unassignedPos), 1);
                playersToAssign.splice(playersToAssign.indexOf(unassignedPlayer), 1);

                const stats = playerStats.get(unassignedPlayer.name)!;
                stats.playingTurns++;

                swapFound = true;
                break;
              }
            }
          }

          if (swapFound) break;
        }

        if (swapFound) continue;
      }
    }

    // Phase 4: Last resort - assign remaining players even if constraints violated
    // Only do this if absolutely necessary
    while (unassignedPositions.length > 0 && playersToAssign.length > 0) {
      const position = unassignedPositions.shift()!;
      const player = playersToAssign.shift()!;

      console.error(`ERROR Inning ${inning + 1}: Forcing ${player.name} to ${position} (NOT in their playable positions)`);
      inningAssignments[position] = player.name;

      // Update stats
      const stats = playerStats.get(player.name)!;
      stats.playingTurns++;
    }

    // If still unassigned positions remain, mark them as errors
    for (const position of unassignedPositions) {
      console.error(`ERROR Inning ${inning + 1}: Cannot fill ${position} - no players available`);
      inningAssignments[position] = "UNASSIGNED";
    }

    assignments.push(inningAssignments);
  }

  return assignments;
}

/**
 * Generate pitching assignments for each batting position
 * Pitchers are unavailable from right before they bat until 3 players after they bat
 */
export function generatePitchingOrder(
  battingOrder: string[],
  attendingPlayers: Player[]
): { battingPosition: number; batter: string; pitcher: string }[] {
  const pitchingAssignments: { battingPosition: number; batter: string; pitcher: string }[] = [];
  
  // Get available pitchers sorted by priority
  const availablePitchers = attendingPlayers
    .filter(p => p.pitchingPriority > 0)
    .sort((a, b) => a.pitchingPriority - b.pitchingPriority); // Lower number = higher priority
  
  if (availablePitchers.length === 0) {
    console.warn("No pitchers available in attending players");
    return battingOrder.map((batter, index) => ({
      battingPosition: index + 1,
      batter,
      pitcher: "No pitcher available"
    }));
  }

  // Helper function to check if a pitcher is available for a specific batting position
  const isPitcherAvailable = (pitcher: Player, battingPosition: number): boolean => {
    const pitcherBattingIndex = battingOrder.findIndex(name => name === pitcher.name);
    
    // If pitcher is not in batting order, they're always available
    if (pitcherBattingIndex === -1) {
      return true;
    }
    
    // Calculate unavailable positions (pitcher position + 3 positions after)
    const unavailablePositions = [];
    for (let i = 0; i <= 3; i++) {
      unavailablePositions.push((pitcherBattingIndex + i) % battingOrder.length);
    }
    
    // Pitcher is unavailable if the current batting position is in the unavailable range
    return !unavailablePositions.includes(battingPosition);
  };

  // Track pitcher usage to balance workload
  const pitcherUsage = new Map<string, number>();
  availablePitchers.forEach(pitcher => {
    pitcherUsage.set(pitcher.name, 0);
  });

  // Assign pitcher for each batting position
  battingOrder.forEach((batter, index) => {
    const battingPosition = index;
    
    // Find available pitchers for this position
    const availableForPosition = availablePitchers.filter(pitcher => 
      isPitcherAvailable(pitcher, battingPosition)
    );

    if (availableForPosition.length === 0) {
      // Emergency fallback: use the highest priority pitcher regardless of availability
      const emergencyPitcher = availablePitchers[0];
      pitchingAssignments.push({
        battingPosition: index + 1,
        batter,
        pitcher: emergencyPitcher.name + " (Emergency)"
      });
      pitcherUsage.set(emergencyPitcher.name, pitcherUsage.get(emergencyPitcher.name)! + 1);
      return;
    }

    // Select best available pitcher based on priority and usage
    const selectedPitcher = availableForPosition.sort((a, b) => {
      // Primary: Higher priority (lower number)
      const priorityDiff = a.pitchingPriority - b.pitchingPriority;
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary: Less usage (balance workload)
      const usageDiff = pitcherUsage.get(a.name)! - pitcherUsage.get(b.name)!;
      return usageDiff;
    })[0];

    pitchingAssignments.push({
      battingPosition: index + 1,
      batter,
      pitcher: selectedPitcher.name
    });
    
    pitcherUsage.set(selectedPitcher.name, pitcherUsage.get(selectedPitcher.name)! + 1);
  });

  return pitchingAssignments;
}

/**
 * Enhanced batting order generation that considers pitcher spacing
 * Priority Rule: Prefer no back-to-back females, but allow them to prevent male stacking
 */
export function generateEnhancedBattingOrder(
  attendingPlayers: Player[]
): { battingOrder: string[]; pitchingOrder: { battingPosition: number; batter: string; pitcher: string }[] } {
  const males = attendingPlayers
    .filter(p => p.gender === 'MALE')
    .sort(() => Math.random() - 0.5);
  
  const females = attendingPlayers
    .filter(p => p.gender === 'FEMALE')
    .sort(() => Math.random() - 0.5);

  // If no females, just return all males
  if (females.length === 0) {
    const battingOrder = males.map(p => p.name);
    const pitchingOrder = generatePitchingOrder(battingOrder, attendingPlayers);
    return { battingOrder, pitchingOrder };
  }

  // If no males, return all females (back-to-back is unavoidable)
  if (males.length === 0) {
    const battingOrder = females.map(p => p.name);
    const pitchingOrder = generatePitchingOrder(battingOrder, attendingPlayers);
    return { battingOrder, pitchingOrder };
  }

  // Strategy: Balance distribution throughout the order, avoiding stacking at either end
  const battingOrder: string[] = [];
  const remainingMales = [...males];
  const remainingFemales = [...females];
  const totalPlayers = males.length + females.length;

  while (remainingMales.length > 0 || remainingFemales.length > 0) {
    const lastGender = battingOrder.length > 0 ? 
      attendingPlayers.find(p => p.name === battingOrder[battingOrder.length - 1])?.gender : null;

    // Calculate ideal ratio based on remaining players
    const remainingTotal = remainingMales.length + remainingFemales.length;
    const maleRatio = remainingMales.length / remainingTotal;
    const femaleRatio = remainingFemales.length / remainingTotal;
    
    // Check for potential stacking issues
    const maleExcess = remainingMales.length - remainingFemales.length;
    const femaleExcess = remainingFemales.length - remainingMales.length;
    const wouldStackMales = maleExcess >= 3;
    const wouldStackFemales = femaleExcess >= 3;

    // Avoid back-to-back females unless necessary to prevent worse stacking
    const allowBackToBackFemale = wouldStackFemales || remainingMales.length === 0;

    // Decision logic: Balance pattern preference with distribution needs
    if (lastGender === 'FEMALE' && !allowBackToBackFemale && remainingMales.length > 0) {
      // Prefer male after female to avoid back-to-back, unless it causes stacking
      battingOrder.push(remainingMales.shift()!.name);
    } else if (wouldStackMales && remainingFemales.length > 0) {
      // Force female to prevent male stacking
      battingOrder.push(remainingFemales.shift()!.name);
    } else if (wouldStackFemales && remainingMales.length > 0) {
      // Force male to prevent female stacking
      battingOrder.push(remainingMales.shift()!.name);
    } else if (maleRatio > 0.6 && remainingMales.length > 0) {
      // Add male if we have significantly more males remaining
      battingOrder.push(remainingMales.shift()!.name);
    } else if (femaleRatio > 0.6 && remainingFemales.length > 0) {
      // Add female if we have significantly more females remaining
      battingOrder.push(remainingFemales.shift()!.name);
    } else if (remainingMales.length > 0 && (lastGender !== 'MALE' || remainingFemales.length === 0)) {
      // Default to male if safe or no females left
      battingOrder.push(remainingMales.shift()!.name);
    } else if (remainingFemales.length > 0) {
      // Add female as fallback
      battingOrder.push(remainingFemales.shift()!.name);
    }
  }

  // Generate pitching order based on batting order
  const pitchingOrder = generatePitchingOrder(battingOrder, attendingPlayers);

  return { battingOrder, pitchingOrder };
}

/**
 * Validate that assignments follow the rules
 */
export function validateAssignments(
  assignments: InningAssignments[],
  attendingPlayers: Player[]
): {
  isValid: boolean;
  issues: string[];
  stats: PlayerStats[];
  genderBalance: ReturnType<typeof analyzeBenchGenderBalance>;
} {
  const issues: string[] = [];
  const playerNames = attendingPlayers.map(p => p.name);
  const stats = calculatePlayerStats(assignments, playerNames);
  const genderBalance = analyzeBenchGenderBalance(assignments, attendingPlayers);

  // Check bench time distribution (should never exceed difference of 1)
  const benchTurns = stats.map(s => s.benchTurns);
  const minBench = Math.min(...benchTurns);
  const maxBench = Math.max(...benchTurns);

  if (maxBench - minBench > 1) {
    issues.push(`Uneven bench distribution: ${minBench}-${maxBench} turns (max difference should be 1)`);
  }

  // Check gender balance on bench
  if (!genderBalance.isBalanced) {
    issues.push(`Gender imbalance on bench (worst deviation: ${(genderBalance.worstImbalance * 100).toFixed(1)}%)`);
  }

  // Check for innings with all one gender on bench
  genderBalance.inningBreakdown.forEach((inning) => {
    if (inning.totalOnBench > 1) {
      if (inning.malesOnBench === 0 && inning.femalesOnBench > 0) {
        issues.push(`Inning ${inning.inning}: All bench players are female (${inning.femalesOnBench} players)`);
      } else if (inning.femalesOnBench === 0 && inning.malesOnBench > 0) {
        issues.push(`Inning ${inning.inning}: All bench players are male (${inning.malesOnBench} players)`);
      }
    }
  });

  // Check minimum women on field requirement (at least 3 per inning)
  const totalFemales = attendingPlayers.filter(p => p.gender === 'FEMALE').length;
  const minWomenRequired = Math.min(3, totalFemales);

  assignments.forEach((inning, inningIndex) => {
    const femalesOnField = FIELD_POSITIONS
      .map(position => inning[position])
      .filter(playerName => {
        const player = attendingPlayers.find(p => p.name === playerName);
        return player && player.gender === 'FEMALE';
      }).length;

    if (femalesOnField < minWomenRequired) {
      issues.push(
        `Inning ${inningIndex + 1}: Only ${femalesOnField} women on field (need ${minWomenRequired})`
      );
    }
  });

  // Check position constraints - players must be able to play their assigned position
  assignments.forEach((inning, inningIndex) => {
    FIELD_POSITIONS.forEach(position => {
      const playerName = inning[position];
      if (playerName && playerName !== "UNASSIGNED") {
        const player = attendingPlayers.find(p => p.name === playerName);
        if (player && !canPlayerPlayPosition(player, position)) {
          issues.push(
            `Inning ${inningIndex + 1}: ${playerName} cannot play ${position}`
          );
        }
      }
    });
  });

  return {
    isValid: issues.length === 0,
    issues,
    stats,
    genderBalance,
  };
}
