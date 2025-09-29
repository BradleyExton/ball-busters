// Test script to verify the enhanced batting order with pitching assignments
console.log("=== Enhanced Batting Order with Pitching Test ===\n");

// Mock the enhanced batting order generation (simplified for testing)
const mockPlayers = [
  { name: "Darren", gender: "MALE", pitchingPriority: 1 },
  { name: "Ryan", gender: "MALE", pitchingPriority: 2 },
  { name: "Kenny", gender: "MALE", pitchingPriority: 3 },
  { name: "Dan", gender: "MALE", pitchingPriority: 0 },
  { name: "Bradley", gender: "MALE", pitchingPriority: 0 },
  { name: "Rosi", gender: "FEMALE", pitchingPriority: 0 },
  { name: "Samantha", gender: "FEMALE", pitchingPriority: 0 },
  { name: "Tay", gender: "FEMALE", pitchingPriority: 0 },
  { name: "Bree", gender: "FEMALE", pitchingPriority: 0 },
];

// Simple batting order generation
function generateSimpleBattingOrder(players) {
  const males = players.filter(p => p.gender === "MALE").sort(() => Math.random() - 0.5);
  const females = players.filter(p => p.gender === "FEMALE").sort(() => Math.random() - 0.5);
  
  const battingOrder = [];
  let maleIndex = 0;
  let femaleIndex = 0;
  
  // Simple M-M-F pattern
  while (maleIndex < males.length || femaleIndex < females.length) {
    // Add up to 2 males
    if (maleIndex < males.length) {
      battingOrder.push(males[maleIndex++].name);
    }
    if (maleIndex < males.length && battingOrder.length % 3 !== 2) {
      battingOrder.push(males[maleIndex++].name);
    }
    
    // Add female
    if (femaleIndex < females.length) {
      battingOrder.push(females[femaleIndex++].name);
    }
  }
  
  return battingOrder;
}

// Simple pitching order generation
function generateSimplePitchingOrder(battingOrder, players, totalInnings = 7) {
  const pitchers = players
    .filter(p => p.pitchingPriority > 0)
    .sort((a, b) => a.pitchingPriority - b.pitchingPriority);
  
  const pitchingOrder = [];
  const batsPerInning = Math.ceil(battingOrder.length / 3);
  
  for (let inning = 0; inning < totalInnings; inning++) {
    // Calculate which batting positions are active this inning
    const startingBatterIndex = (inning * batsPerInning) % battingOrder.length;
    const activeBattingPositions = [];
    for (let i = 0; i < batsPerInning; i++) {
      activeBattingPositions.push((startingBatterIndex + i) % battingOrder.length);
    }
    
    // Find available pitchers (not currently batting)
    const availablePitchers = pitchers.filter(pitcher => {
      const pitcherBattingPosition = battingOrder.findIndex(name => name === pitcher.name);
      return pitcherBattingPosition === -1 || !activeBattingPositions.includes(pitcherBattingPosition);
    });
    
    // Select best available pitcher (highest priority = lowest number)
    const selectedPitcher = availablePitchers.length > 0 
      ? availablePitchers[0] 
      : pitchers[inning % pitchers.length]; // Fallback
    
    pitchingOrder.push({
      inning: inning + 1,
      pitcher: selectedPitcher.name
    });
  }
  
  return pitchingOrder;
}

// Test the system
const battingOrder = generateSimpleBattingOrder(mockPlayers);
const pitchingOrder = generateSimplePitchingOrder(battingOrder, mockPlayers);

console.log("=== Batting Order ===");
battingOrder.forEach((player, index) => {
  const playerData = mockPlayers.find(p => p.name === player);
  console.log(`${index + 1}. ${player} (${playerData.gender === 'MALE' ? 'M' : 'F'})`);
});

console.log("\n=== Pitching Schedule ===");
pitchingOrder.forEach(assignment => {
  const pitcher = mockPlayers.find(p => p.name === assignment.pitcher);
  const priorityLabel = pitcher.pitchingPriority === 1 ? "Primary" : 
                       pitcher.pitchingPriority === 2 ? "Secondary" : 
                       pitcher.pitchingPriority === 3 ? "Tertiary" : "Emergency";
  console.log(`Inning ${assignment.inning}: ${assignment.pitcher} (${priorityLabel})`);
});

console.log("\n=== Pitcher Usage Analysis ===");
const pitcherStats = {};
pitchingOrder.forEach(assignment => {
  pitcherStats[assignment.pitcher] = (pitcherStats[assignment.pitcher] || 0) + 1;
});

Object.entries(pitcherStats).forEach(([pitcher, count]) => {
  const pitcherData = mockPlayers.find(p => p.name === pitcher);
  const percentage = ((count / pitchingOrder.length) * 100).toFixed(1);
  console.log(`${pitcher}: ${count} innings (${percentage}%) - Priority ${pitcherData.pitchingPriority}`);
});

console.log("\n=== Conflict Analysis ===");
pitchingOrder.forEach(assignment => {
  const pitcherBattingPosition = battingOrder.findIndex(name => name === assignment.pitcher);
  if (pitcherBattingPosition !== -1) {
    const batsPerInning = Math.ceil(battingOrder.length / 3);
    const startingBatterIndex = ((assignment.inning - 1) * batsPerInning) % battingOrder.length;
    const activeBattingPositions = [];
    for (let i = 0; i < batsPerInning; i++) {
      activeBattingPositions.push((startingBatterIndex + i) % battingOrder.length);
    }
    
    if (activeBattingPositions.includes(pitcherBattingPosition)) {
      console.log(`⚠️  Inning ${assignment.inning}: ${assignment.pitcher} is pitching AND batting (position ${pitcherBattingPosition + 1})`);
    } else {
      console.log(`✅ Inning ${assignment.inning}: ${assignment.pitcher} is pitching, not batting this inning`);
    }
  } else {
    console.log(`✅ Inning ${assignment.inning}: ${assignment.pitcher} is pitching (not in batting order)`);
  }
});

console.log("\n=== Test Complete ===");
