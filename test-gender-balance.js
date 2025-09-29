// Simple test to validate gender balance in bench assignments
// This runs standalone without requiring modules

console.log("=== Gender-Balanced Position Assignment Test ===\n");

// Mock player data with gender information
const mockPlayers = [
  // Females (6)
  { name: "Joleeza", gender: "FEMALE", preferredPosition: "none", playablePositions: ["CATCHER", "FIRST_BASE"] },
  { name: "Rosi", gender: "FEMALE", preferredPosition: "FIRST_BASE", playablePositions: ["CATCHER", "THIRD_BASE"] },
  { name: "Samantha", gender: "FEMALE", preferredPosition: "CATCHER", playablePositions: ["FIRST_BASE", "THIRD_BASE"] },
  { name: "Madelaine", gender: "FEMALE", preferredPosition: "RIGHT_FIELD", playablePositions: ["FIRST_BASE", "THIRD_BASE"] },
  { name: "Tay", gender: "FEMALE", preferredPosition: "SECOND_BASE", playablePositions: ["FIRST_BASE", "THIRD_BASE"] },
  { name: "Bree", gender: "FEMALE", preferredPosition: "SECOND_BASE", playablePositions: ["FIRST_BASE", "CATCHER"] },
  
  // Males (8)
  { name: "Dan", gender: "MALE", preferredPosition: "ROVER", playablePositions: ["LEFT_FIELD", "RIGHT_FIELD"] },
  { name: "Dylan", gender: "MALE", preferredPosition: "THIRD_BASE", playablePositions: ["RIGHT_FIELD", "FIRST_BASE"] },
  { name: "Bradley", gender: "MALE", preferredPosition: "ROVER", playablePositions: ["LEFT_FIELD", "SHORTSTOP"] },
  { name: "Steve B", gender: "MALE", preferredPosition: "none", playablePositions: ["LEFT_FIELD", "SHORTSTOP"] },
  { name: "Darren", gender: "MALE", preferredPosition: "CENTER_FIELD", playablePositions: ["FIRST_BASE"] },
  { name: "Matt", gender: "MALE", preferredPosition: "RIGHT_FIELD", playablePositions: ["LEFT_FIELD", "SHORTSTOP"] },
  { name: "Kenny", gender: "MALE", preferredPosition: "SHORTSTOP", playablePositions: ["LEFT_FIELD", "THIRD_BASE"] },
  { name: "Ryan", gender: "MALE", preferredPosition: "LEFT_FIELD", playablePositions: ["ROVER", "SHORTSTOP"] },
];

console.log(`Testing with ${mockPlayers.length} players:`);
console.log(`Males: ${mockPlayers.filter(p => p.gender === 'MALE').length}`);
console.log(`Females: ${mockPlayers.filter(p => p.gender === 'FEMALE').length}`);

// Test scenario: 14 players total, 5 on bench each inning
const totalPlayers = mockPlayers.length;
const playingPositions = 9;
const benchSize = totalPlayers - playingPositions;

console.log(`\nBench size per inning: ${benchSize}`);

// Calculate expected gender ratio
const maleCount = mockPlayers.filter(p => p.gender === 'MALE').length;
const femaleCount = mockPlayers.filter(p => p.gender === 'FEMALE').length;
const maleRatio = maleCount / totalPlayers;
const femaleRatio = femaleCount / totalPlayers;

console.log(`Team gender ratio - Males: ${(maleRatio * 100).toFixed(1)}%, Females: ${(femaleRatio * 100).toFixed(1)}%`);

// Expected bench composition per inning
const expectedMalesOnBench = Math.round(benchSize * maleRatio);
const expectedFemalesOnBench = benchSize - expectedMalesOnBench;

console.log(`Expected bench composition per inning: ${expectedMalesOnBench} males, ${expectedFemalesOnBench} females`);

// Simple algorithm simulation to test bench gender balance
function simulateGenderBalancedBench(players, innings = 7) {
  const results = [];
  const playerStats = new Map();
  
  // Initialize stats
  players.forEach(p => {
    playerStats.set(p.name, { benchTurns: 0, lastBenchInning: -1 });
  });
  
  for (let inning = 0; inning < innings; inning++) {
    const males = players.filter(p => p.gender === 'MALE');
    const females = players.filter(p => p.gender === 'FEMALE');
    
    // Sort by bench priority
    males.sort((a, b) => {
      const aStats = playerStats.get(a.name);
      const bStats = playerStats.get(b.name);
      if (aStats.benchTurns !== bStats.benchTurns) {
        return aStats.benchTurns - bStats.benchTurns; // Fewer bench turns = higher priority
      }
      return aStats.lastBenchInning - bStats.lastBenchInning;
    });
    
    females.sort((a, b) => {
      const aStats = playerStats.get(a.name);
      const bStats = playerStats.get(b.name);
      if (aStats.benchTurns !== bStats.benchTurns) {
        return aStats.benchTurns - bStats.benchTurns;
      }
      return aStats.lastBenchInning - bStats.lastBenchInning;
    });
    
    // Select for bench with gender balance
    const benchPlayers = [];
    const actualMalesOnBench = Math.min(expectedMalesOnBench, males.length);
    const actualFemalesOnBench = Math.min(benchSize - actualMalesOnBench, females.length);
    
    // Add males
    for (let i = 0; i < actualMalesOnBench; i++) {
      benchPlayers.push(males[i]);
      const stats = playerStats.get(males[i].name);
      stats.benchTurns++;
      stats.lastBenchInning = inning;
    }
    
    // Add females
    for (let i = 0; i < actualFemalesOnBench; i++) {
      benchPlayers.push(females[i]);
      const stats = playerStats.get(females[i].name);
      stats.benchTurns++;
      stats.lastBenchInning = inning;
    }
    
    const malesOnBench = benchPlayers.filter(p => p.gender === 'MALE').length;
    const femalesOnBench = benchPlayers.filter(p => p.gender === 'FEMALE').length;
    
    results.push({
      inning: inning + 1,
      benchPlayers: benchPlayers.map(p => p.name),
      malesOnBench,
      femalesOnBench,
      totalOnBench: benchPlayers.length,
      isBalanced: malesOnBench > 0 && femalesOnBench > 0
    });
  }
  
  return results;
}

// Run simulation
const simulation = simulateGenderBalancedBench(mockPlayers, 7);

console.log("\n=== Inning-by-Inning Bench Analysis ===");
simulation.forEach(result => {
  const balanceIndicator = result.isBalanced ? '✅' : '⚠️';
  console.log(`Inning ${result.inning}: ${result.malesOnBench}M / ${result.femalesOnBench}F ${balanceIndicator}`);
  console.log(`  Players: ${result.benchPlayers.join(', ')}`);
});

// Overall analysis
const balancedInnings = simulation.filter(r => r.isBalanced).length;
const totalInnings = simulation.length;
const genderBalanceRate = (balancedInnings / totalInnings) * 100;

console.log(`\n=== Summary ===`);
console.log(`Gender-balanced innings: ${balancedInnings}/${totalInnings} (${genderBalanceRate.toFixed(1)}%)`);

const allSingleGender = simulation.filter(r => r.malesOnBench === 0 || r.femalesOnBench === 0);
if (allSingleGender.length > 0) {
  console.log(`Innings with all one gender on bench: ${allSingleGender.length}`);
  allSingleGender.forEach(inning => {
    const genderType = inning.malesOnBench === 0 ? 'all female' : 'all male';
    console.log(`  Inning ${inning.inning}: ${genderType} (${inning.totalOnBench} players)`);
  });
} else {
  console.log("✅ No innings with all one gender on bench!");
}

// Bench distribution fairness
console.log(`\n=== Bench Turn Distribution ===`);
const benchStats = [];
mockPlayers.forEach(player => {
  const totalBenchTurns = simulation.reduce((sum, inning) => {
    return sum + (inning.benchPlayers.includes(player.name) ? 1 : 0);
  }, 0);
  benchStats.push({ name: player.name, gender: player.gender, benchTurns: totalBenchTurns });
});

benchStats.sort((a, b) => a.benchTurns - b.benchTurns);
benchStats.forEach(stat => {
  console.log(`${stat.name} (${stat.gender}): ${stat.benchTurns} bench turns`);
});

const benchTurns = benchStats.map(s => s.benchTurns);
const minBench = Math.min(...benchTurns);
const maxBench = Math.max(...benchTurns);
console.log(`\nBench turn variance: ${minBench}-${maxBench} (difference: ${maxBench - minBench})`);

if (maxBench - minBench <= 1) {
  console.log("✅ Excellent bench distribution!");
} else if (maxBench - minBench <= 2) {
  console.log("✅ Good bench distribution!");
} else {
  console.log("⚠️ Bench distribution could be improved");
}
