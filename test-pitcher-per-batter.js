// Test the updated pitching logic where each batter has a pitcher assigned
console.log("=== Updated Pitching Logic Test ===\n");

// Mock players with pitching priorities
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

// Generate batting order (M-M-F pattern)
function generateBattingOrder(players) {
  const males = players.filter(p => p.gender === "MALE").sort(() => Math.random() - 0.5);
  const females = players.filter(p => p.gender === "FEMALE").sort(() => Math.random() - 0.5);
  
  const battingOrder = [];
  let maleIndex = 0;
  let femaleIndex = 0;
  
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

// Generate pitching assignments with new logic
function generatePitchingAssignments(battingOrder, players) {
  const pitchers = players
    .filter(p => p.pitchingPriority > 0)
    .sort((a, b) => a.pitchingPriority - b.pitchingPriority);
  
  const assignments = [];
  const pitcherUsage = new Map();
  pitchers.forEach(p => pitcherUsage.set(p.name, 0));
  
  // Helper function to check if pitcher is available
  const isPitcherAvailable = (pitcher, battingPosition) => {
    const pitcherBattingIndex = battingOrder.findIndex(name => name === pitcher.name);
    
    if (pitcherBattingIndex === -1) return true; // Not batting
    
    // Unavailable from their position until 3 positions after
    const unavailablePositions = [];
    for (let i = 0; i <= 3; i++) {
      unavailablePositions.push((pitcherBattingIndex + i) % battingOrder.length);
    }
    
    return !unavailablePositions.includes(battingPosition);
  };
  
  battingOrder.forEach((batter, index) => {
    const battingPosition = index;
    
    // Find available pitchers
    const availablePitchers = pitchers.filter(pitcher => 
      isPitcherAvailable(pitcher, battingPosition)
    );
    
    let selectedPitcher;
    if (availablePitchers.length === 0) {
      // Emergency: use highest priority pitcher
      selectedPitcher = pitchers[0];
      assignments.push({
        battingPosition: index + 1,
        batter,
        pitcher: selectedPitcher.name + " (Emergency)",
        isEmergency: true
      });
    } else {
      // Select best available pitcher
      selectedPitcher = availablePitchers.sort((a, b) => {
        const priorityDiff = a.pitchingPriority - b.pitchingPriority;
        if (priorityDiff !== 0) return priorityDiff;
        
        return pitcherUsage.get(a.name) - pitcherUsage.get(b.name);
      })[0];
      
      assignments.push({
        battingPosition: index + 1,
        batter,
        pitcher: selectedPitcher.name,
        isEmergency: false
      });
    }
    
    pitcherUsage.set(selectedPitcher.name, pitcherUsage.get(selectedPitcher.name) + 1);
  });
  
  return assignments;
}

// Test the system
const battingOrder = generateBattingOrder(mockPlayers);
const pitchingAssignments = generatePitchingAssignments(battingOrder, mockPlayers);

console.log("=== Batting Order ===");
battingOrder.forEach((player, index) => {
  const playerData = mockPlayers.find(p => p.name === player);
  console.log(`${index + 1}. ${player} (${playerData.gender === 'MALE' ? 'M' : 'F'})`);
});

console.log("\n=== Pitching Assignments ===");
pitchingAssignments.forEach(assignment => {
  const pitcher = mockPlayers.find(p => p.name === assignment.pitcher.replace(" (Emergency)", ""));
  const priorityLabel = pitcher.pitchingPriority === 1 ? "Primary" : 
                       pitcher.pitchingPriority === 2 ? "Secondary" : 
                       pitcher.pitchingPriority === 3 ? "Tertiary" : "Emergency";
  const emergencyFlag = assignment.isEmergency ? " 🚨" : "";
  console.log(`Position ${assignment.battingPosition}: ${assignment.batter} ← ${assignment.pitcher} (${priorityLabel})${emergencyFlag}`);
});

console.log("\n=== Pitcher Workload Analysis ===");
const pitcherStats = {};
pitchingAssignments.forEach(assignment => {
  const cleanPitcher = assignment.pitcher.replace(" (Emergency)", "");
  pitcherStats[cleanPitcher] = (pitcherStats[cleanPitcher] || 0) + 1;
});

Object.entries(pitcherStats).forEach(([pitcher, count]) => {
  const pitcherData = mockPlayers.find(p => p.name === pitcher);
  const percentage = ((count / pitchingAssignments.length) * 100).toFixed(1);
  console.log(`${pitcher}: ${count} assignments (${percentage}%) - Priority ${pitcherData.pitchingPriority}`);
});

console.log("\n=== Unavailability Analysis ===");
pitchingAssignments.forEach(assignment => {
  const cleanPitcher = assignment.pitcher.replace(" (Emergency)", "");
  const pitcherBattingIndex = battingOrder.findIndex(name => name === cleanPitcher);
  
  if (pitcherBattingIndex !== -1) {
    const battingPosition = assignment.battingPosition - 1; // Convert to 0-based
    const unavailableStart = pitcherBattingIndex;
    const unavailableEnd = (pitcherBattingIndex + 3) % battingOrder.length;
    
    let unavailableRange = [];
    for (let i = 0; i <= 3; i++) {
      unavailableRange.push(((pitcherBattingIndex + i) % battingOrder.length) + 1);
    }
    
    const isInUnavailableRange = unavailableRange.includes(assignment.battingPosition);
    const status = assignment.isEmergency ? "🚨 EMERGENCY" : 
                  isInUnavailableRange ? "⚠️  CONFLICT" : "✅ AVAILABLE";
    
    console.log(`${cleanPitcher} bats at position ${pitcherBattingIndex + 1}, unavailable for positions ${unavailableRange.join(',')} - Position ${assignment.battingPosition}: ${status}`);
  } else {
    console.log(`${cleanPitcher} not in batting order - Position ${assignment.battingPosition}: ✅ ALWAYS AVAILABLE`);
  }
});

console.log("\n=== Test Complete ===");
