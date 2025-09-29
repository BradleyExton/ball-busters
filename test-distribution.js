// Test with various gender ratios to see distribution
console.log("=== Testing Distribution with Various Ratios ===\n");

const scenarios = [
  {
    name: "Balanced (5M, 5F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
      { name: "M5", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" },
      { name: "F5", gender: "FEMALE" }
    ]
  },
  {
    name: "Male heavy (7M, 3F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
      { name: "M5", gender: "MALE" }, { name: "M6", gender: "MALE" },
      { name: "M7", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }
    ]
  },
  {
    name: "Female heavy (3M, 7F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" },
      { name: "F5", gender: "FEMALE" }, { name: "F6", gender: "FEMALE" },
      { name: "F7", gender: "FEMALE" }
    ]
  },
  {
    name: "Original problem (5M, 4F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
      { name: "M5", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
    ]
  }
];

// Enhanced batting order generation (same as app logic)
function generateEnhancedBattingOrder(attendingPlayers) {
  const males = attendingPlayers
    .filter(p => p.gender === 'MALE')
    .sort(() => Math.random() - 0.5);
  
  const females = attendingPlayers
    .filter(p => p.gender === 'FEMALE')
    .sort(() => Math.random() - 0.5);

  if (females.length === 0) return males;
  if (males.length === 0) return females;

  const battingOrder = [];
  const remainingMales = [...males];
  const remainingFemales = [...females];
  const totalPlayers = males.length + females.length;

  while (remainingMales.length > 0 || remainingFemales.length > 0) {
    const lastGender = battingOrder.length > 0 ? 
      attendingPlayers.find(p => p.name === battingOrder[battingOrder.length - 1])?.gender : null;

    const remainingTotal = remainingMales.length + remainingFemales.length;
    const maleRatio = remainingMales.length / remainingTotal;
    const femaleRatio = remainingFemales.length / remainingTotal;
    
    const maleExcess = remainingMales.length - remainingFemales.length;
    const femaleExcess = remainingFemales.length - remainingMales.length;
    const wouldStackMales = maleExcess >= 3;
    const wouldStackFemales = femaleExcess >= 3;

    const allowBackToBackFemale = wouldStackFemales || remainingMales.length === 0;

    if (lastGender === 'FEMALE' && !allowBackToBackFemale && remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
    } else if (wouldStackMales && remainingFemales.length > 0) {
      battingOrder.push(remainingFemales.shift().name);
    } else if (wouldStackFemales && remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
    } else if (maleRatio > 0.6 && remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
    } else if (femaleRatio > 0.6 && remainingFemales.length > 0) {
      battingOrder.push(remainingFemales.shift().name);
    } else if (remainingMales.length > 0 && (lastGender !== 'MALE' || remainingFemales.length === 0)) {
      battingOrder.push(remainingMales.shift().name);
    } else if (remainingFemales.length > 0) {
      battingOrder.push(remainingFemales.shift().name);
    }
  }

  return battingOrder.map(name => attendingPlayers.find(p => p.name === name));
}

function analyzeDistribution(order, name) {
  const pattern = order.map(p => p.gender[0]).join('');
  
  // Check for stacking at end
  let malesAtEnd = 0;
  let femalesAtEnd = 0;
  for (let i = pattern.length - 1; i >= 0; i--) {
    if (pattern[i] === 'M') malesAtEnd++;
    else break;
  }
  for (let i = pattern.length - 1; i >= 0; i--) {
    if (pattern[i] === 'F') femalesAtEnd++;
    else break;
  }
  
  // Check for stacking at beginning
  let malesAtStart = 0;
  let femalesAtStart = 0;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === 'M') malesAtStart++;
    else break;
  }
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === 'F') femalesAtStart++;
    else break;
  }
  
  // Count consecutive sequences
  const sequences = pattern.match(/M+|F+/g) || [];
  const longSequences = sequences.filter(seq => seq.length >= 3);
  
  console.log(`${name}:`);
  console.log(`  Pattern: ${pattern}`);
  console.log(`  End stacking: ${malesAtEnd > 2 ? `${malesAtEnd}M` : femalesAtEnd > 2 ? `${femalesAtEnd}F` : 'none'}`);
  console.log(`  Start stacking: ${malesAtStart > 2 ? `${malesAtStart}M` : femalesAtStart > 2 ? `${femalesAtStart}F` : 'none'}`);
  console.log(`  Long sequences (3+): ${longSequences.length > 0 ? longSequences.join(', ') : 'none'}`);
  console.log();
}

// Test all scenarios
scenarios.forEach(scenario => {
  const order = generateEnhancedBattingOrder(scenario.players);
  analyzeDistribution(order, scenario.name);
});

console.log("=== Distribution Test Complete ===");
