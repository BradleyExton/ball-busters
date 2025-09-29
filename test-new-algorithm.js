// Test script to verify the new position assignment algorithm
const { players } = require("./app/data/players.ts");
const { 
  generateOptimizedAssignments,
  validateAssignments,
  calculatePlayerStats,
  FIELD_POSITIONS 
} = require("./app/utils/positionUtils.ts");

console.log("=== New Position Assignment Algorithm Test ===\n");

// Test with all players
console.log("Testing with all players:", players.length);
const assignments = generateOptimizedAssignments(players, 7);
const validation = validateAssignments(assignments, players);
const stats = calculatePlayerStats(assignments, players.map(p => p.name));

console.log("\n=== Validation Results ===");
console.log("Valid:", validation.isValid);
if (!validation.isValid) {
  console.log("Issues:", validation.issues);
}

console.log("\n=== Player Statistics ===");
stats.forEach(playerStat => {
  console.log(`${playerStat.name}:`);
  console.log(`  Bench turns: ${playerStat.benchTurns}`);
  console.log(`  Playing turns: ${playerStat.playingTurns}`);
  console.log(`  Preferred position turns: ${playerStat.preferredPositionTurns}`);
  console.log(`  Preferred position rate: ${playerStat.playingTurns > 0 ? ((playerStat.preferredPositionTurns / playerStat.playingTurns) * 100).toFixed(1) : 0}%`);
  console.log("");
});

console.log("=== Summary Statistics ===");
const benchTurns = stats.map(s => s.benchTurns);
const minBench = Math.min(...benchTurns);
const maxBench = Math.max(...benchTurns);
const avgBench = benchTurns.reduce((a, b) => a + b, 0) / benchTurns.length;

console.log(`Bench turns - Min: ${minBench}, Max: ${maxBench}, Avg: ${avgBench.toFixed(1)}, Variance: ${maxBench - minBench}`);

const preferredPositionRates = stats.map(s => s.playingTurns > 0 ? s.preferredPositionTurns / s.playingTurns : 0);
const avgPreferredRate = preferredPositionRates.reduce((a, b) => a + b, 0) / preferredPositionRates.length;
console.log(`Average preferred position rate: ${(avgPreferredRate * 100).toFixed(1)}%`);

console.log("\n=== Inning-by-Inning Assignments ===");
assignments.forEach((inning, index) => {
  console.log(`\nInning ${index + 1}:`);
  FIELD_POSITIONS.forEach(position => {
    const playerName = inning[position];
    const player = players.find(p => p.name === playerName);
    const isPreferred = player && (
      player.preferredPosition !== "none" &&
      player.preferredPosition !== null &&
      (player.preferredPosition === position || 
       (player.preferredPosition && player.preferredPosition.includes && 
        player.preferredPosition.includes(position.replace(/[0-9]/, "_").toUpperCase())))
    );
    console.log(`  ${position}: ${playerName || 'UNASSIGNED'} ${isPreferred ? '⭐' : ''}`);
  });
  console.log(`  Bench: ${inning.bench.join(', ')}`);
});

// Test with a smaller subset (12 players) to test bench rotation
console.log("\n\n=== Testing with 12 Players (3 on bench each inning) ===");
const smallerGroup = players.slice(0, 12);
const smallAssignments = generateOptimizedAssignments(smallerGroup, 7);
const smallValidation = validateAssignments(smallAssignments, smallerGroup);
const smallStats = calculatePlayerStats(smallAssignments, smallerGroup.map(p => p.name));

console.log("\nValidation:", smallValidation.isValid);
if (!smallValidation.isValid) {
  console.log("Issues:", smallValidation.issues);
}

const smallBenchTurns = smallStats.map(s => s.benchTurns);
const smallMinBench = Math.min(...smallBenchTurns);
const smallMaxBench = Math.max(...smallBenchTurns);
console.log(`Bench distribution - Min: ${smallMinBench}, Max: ${smallMaxBench}, Variance: ${smallMaxBench - smallMinBench}`);

const smallPreferredRates = smallStats.map(s => s.playingTurns > 0 ? s.preferredPositionTurns / s.playingTurns : 0);
const smallAvgPreferredRate = smallPreferredRates.reduce((a, b) => a + b, 0) / smallPreferredRates.length;
console.log(`Average preferred position rate: ${(smallAvgPreferredRate * 100).toFixed(1)}%`);
