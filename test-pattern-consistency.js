// Test multiple runs to see pattern consistency
console.log("=== Pattern Consistency Test ===\n");

const testPlayers = [
  { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
  { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
  { name: "M5", gender: "MALE" },
  { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
  { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
];

// Enhanced batting order generation (same logic as in the app)
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

  const malesNeededToSeparateFemales = Math.max(0, females.length - 1);
  const canAvoidAllBackToBack = males.length >= malesNeededToSeparateFemales;

  while (remainingMales.length > 0 || remainingFemales.length > 0) {
    const lastPlayerGender = battingOrder.length > 0 ? 
      attendingPlayers.find(p => p.name === battingOrder[battingOrder.length - 1])?.gender : null;

    if (lastPlayerGender === 'FEMALE' && remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
      continue;
    }

    const currentPosition = battingOrder.length;
    const isThirdPosition = (currentPosition + 1) % 3 === 0;
    
    const canAddFemale = remainingFemales.length > 0 && lastPlayerGender !== 'FEMALE';
    
    const femalesAfterThisOne = remainingFemales.length - 1;
    const malesNeededForSeparation = Math.max(0, femalesAfterThisOne - 1);
    const malesAvailableForSeparation = remainingMales.length - 1;
    const canAffordToUseMale = malesAvailableForSeparation >= malesNeededForSeparation || !canAvoidAllBackToBack;

    if (isThirdPosition && canAddFemale) {
      battingOrder.push(remainingFemales.shift().name);
    } else if (remainingMales.length > 0 && (canAffordToUseMale || remainingFemales.length === 0)) {
      battingOrder.push(remainingMales.shift().name);
    } else if (canAddFemale) {
      battingOrder.push(remainingFemales.shift().name);
    } else if (remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
    } else if (remainingFemales.length > 0) {
      battingOrder.push(remainingFemales.shift().name);
    }
  }

  return battingOrder.map(name => attendingPlayers.find(p => p.name === name));
}

function analyzePattern(order) {
  const pattern = order.map(p => p.gender[0]).join('');
  const genders = order.map(p => p.gender[0]);
  
  // Count M-M-F triplets
  let mmfCount = 0;
  for (let i = 0; i <= genders.length - 3; i++) {
    if (genders[i] === 'M' && genders[i+1] === 'M' && genders[i+2] === 'F') {
      mmfCount++;
    }
  }
  
  // Check for back-to-back females
  let backToBackF = 0;
  for (let i = 0; i < genders.length - 1; i++) {
    if (genders[i] === 'F' && genders[i+1] === 'F') {
      backToBackF++;
    }
  }
  
  // Check for consecutive males at end
  let endMaleStreak = 0;
  for (let i = genders.length - 1; i >= 0; i--) {
    if (genders[i] === 'M') {
      endMaleStreak++;
    } else {
      break;
    }
  }
  
  return {
    pattern,
    mmfCount,
    backToBackF,
    endMaleStreak: endMaleStreak > 1 ? endMaleStreak : 0
  };
}

console.log("Testing 5 runs with 5M, 4F scenario:\n");

for (let run = 1; run <= 5; run++) {
  const order = generateEnhancedBattingOrder(testPlayers);
  const analysis = analyzePattern(order);
  
  console.log(`Run ${run}: ${analysis.pattern}`);
  console.log(`  M-M-F triplets: ${analysis.mmfCount}`);
  console.log(`  Back-to-back F: ${analysis.backToBackF}`);
  console.log(`  Males at end: ${analysis.endMaleStreak > 0 ? analysis.endMaleStreak : 'none'}`);
  console.log();
}

console.log("=== Pattern Analysis Complete ===");
