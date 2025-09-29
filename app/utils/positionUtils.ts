import { players, POSITIONS } from '../data/players';

export interface Player {
  name: string;
  preferredPosition: string | typeof POSITIONS[keyof typeof POSITIONS];
  playablePositions: (typeof POSITIONS[keyof typeof POSITIONS])[];
  gender: string;
  hittingDistance: number;
  runningSpeed: number;
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
 */
export function canPlayerPlayPosition(player: Player, position: string): boolean {
  if (!player || !player.playablePositions) {
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
 * Generate improved position assignments following the three rules:
 * 1. Equal bench time distribution
 * 2. Preferred position priority
 * 3. Fallback to playable positions
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

  for (let inning = 0; inning < totalInnings; inning++) {
    const inningAssignments: InningAssignments = { bench: [] };
    const playersNeedingBench = new Set<string>();
    const availableForPlaying = new Set(playerNames);

    // Rule 1: Determine who should be on bench based on equal distribution AND gender balance
    const averageBenchTurns = (inning + 1) * (attendingPlayers.length - 9) / attendingPlayers.length;
    
    // Determine how many players should be benched this inning
    const totalPlayersNeedingBench = Math.max(0, attendingPlayers.length - 9);
    
    if (totalPlayersNeedingBench > 0) {
      // Separate players by gender
      const malePlayerNames = attendingPlayers.filter(p => p.gender === 'MALE').map(p => p.name);
      const femalePlayerNames = attendingPlayers.filter(p => p.gender === 'FEMALE').map(p => p.name);
      
      // Calculate ideal gender distribution for bench
      const totalMales = malePlayerNames.length;
      const totalFemales = femalePlayerNames.length;
      const maleRatio = totalMales / attendingPlayers.length;
      const femaleRatio = totalFemales / attendingPlayers.length;
      
      // Target bench composition (rounded to nearest whole number)
      const targetMalesOnBench = Math.round(totalPlayersNeedingBench * maleRatio);
      const targetFemalesOnBench = totalPlayersNeedingBench - targetMalesOnBench;
      
      // Get bench priority for each gender
      const maleBenchPriority = malePlayerNames
        .map(name => ({
          name,
          stats: playerStats.get(name)!,
          benchDeficit: averageBenchTurns - playerStats.get(name)!.benchTurns,
        }))
        .sort((a, b) => {
          if (Math.abs(a.benchDeficit - b.benchDeficit) > 0.1) {
            return b.benchDeficit - a.benchDeficit;
          }
          return a.stats.lastBenchInning - b.stats.lastBenchInning;
        });

      const femaleBenchPriority = femalePlayerNames
        .map(name => ({
          name,
          stats: playerStats.get(name)!,
          benchDeficit: averageBenchTurns - playerStats.get(name)!.benchTurns,
        }))
        .sort((a, b) => {
          if (Math.abs(a.benchDeficit - b.benchDeficit) > 0.1) {
            return b.benchDeficit - a.benchDeficit;
          }
          return a.stats.lastBenchInning - b.stats.lastBenchInning;
        });

      // Select males for bench (up to target, but ensure we have enough)
      const actualMalesOnBench = Math.min(targetMalesOnBench, maleBenchPriority.length, totalPlayersNeedingBench);
      for (let i = 0; i < actualMalesOnBench; i++) {
        const playerToBench = maleBenchPriority[i];
        playersNeedingBench.add(playerToBench.name);
        availableForPlaying.delete(playerToBench.name);
        inningAssignments.bench.push(playerToBench.name);
        
        const stats = playerStats.get(playerToBench.name)!;
        stats.benchTurns++;
        stats.lastBenchInning = inning;
      }

      // Select females for bench (fill remaining bench spots)
      const remainingBenchSpots = totalPlayersNeedingBench - actualMalesOnBench;
      const actualFemalesOnBench = Math.min(remainingBenchSpots, femaleBenchPriority.length);
      for (let i = 0; i < actualFemalesOnBench; i++) {
        const playerToBench = femaleBenchPriority[i];
        playersNeedingBench.add(playerToBench.name);
        availableForPlaying.delete(playerToBench.name);
        inningAssignments.bench.push(playerToBench.name);
        
        const stats = playerStats.get(playerToBench.name)!;
        stats.benchTurns++;
        stats.lastBenchInning = inning;
      }

      // Fallback: if we still need more players on bench (shouldn't happen with proper ratios)
      const stillNeedBench = totalPlayersNeedingBench - inningAssignments.bench.length;
      if (stillNeedBench > 0) {
        const remainingPlayers = playerNames
          .filter(name => !playersNeedingBench.has(name))
          .map(name => ({
            name,
            stats: playerStats.get(name)!,
            benchDeficit: averageBenchTurns - playerStats.get(name)!.benchTurns,
          }))
          .sort((a, b) => b.benchDeficit - a.benchDeficit);

        for (let i = 0; i < stillNeedBench && i < remainingPlayers.length; i++) {
          const playerToBench = remainingPlayers[i];
          playersNeedingBench.add(playerToBench.name);
          availableForPlaying.delete(playerToBench.name);
          inningAssignments.bench.push(playerToBench.name);
          
          const stats = playerStats.get(playerToBench.name)!;
          stats.benchTurns++;
          stats.lastBenchInning = inning;
        }
      }
    }

    // Rule 2 & 3: Assign field positions with preferred position priority
    const unassignedPositions = [...FIELD_POSITIONS];
    const playingPlayers = attendingPlayers.filter(p => availableForPlaying.has(p.name));

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
        canPlayerPlayPosition(player, preferredDisplayPosition)
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
    for (const position of [...unassignedPositions]) {
      // Find players who can play this position, prioritizing those with fewer playing turns
      const eligiblePlayers = playersToAssign
        .filter(player => canPlayerPlayPosition(player, position))
        .sort((a, b) => {
          const aStats = playerStats.get(a.name)!;
          const bStats = playerStats.get(b.name)!;
          return aStats.playingTurns - bStats.playingTurns;
        });

      if (eligiblePlayers.length > 0) {
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
      }
    }

    // Phase 3: Fallback - assign any remaining players to any remaining positions
    while (unassignedPositions.length > 0 && playersToAssign.length > 0) {
      const position = unassignedPositions.pop()!;
      const player = playersToAssign.pop()!;
      
      inningAssignments[position] = player.name;
      
      // Update stats
      const stats = playerStats.get(player.name)!;
      stats.playingTurns++;
    }

    assignments.push(inningAssignments);
  }

  return assignments;
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

  // Check bench time distribution
  const benchTurns = stats.map(s => s.benchTurns);
  const minBench = Math.min(...benchTurns);
  const maxBench = Math.max(...benchTurns);
  
  if (maxBench - minBench > 2) {
    issues.push(`Uneven bench distribution: ${minBench}-${maxBench} turns`);
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

  // Check position constraints
  assignments.forEach((inning, inningIndex) => {
    FIELD_POSITIONS.forEach(position => {
      const playerName = inning[position];
      if (playerName) {
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
