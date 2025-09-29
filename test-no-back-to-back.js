// Test the "no back-to-back females" priority rule
console.log("=== Testing No Back-to-Back Females Rule ===\n");

// Mock players with different gender ratios to test the rule
const testScenarios = [
  {
    name: "Balanced team (5M, 4F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
      { name: "M5", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
    ]
  },
  {
    name: "Male heavy (7M, 2F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
      { name: "M5", gender: "MALE" }, { name: "M6", gender: "MALE" }, 
      { name: "M7", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }
    ]
  },
  {
    name: "Female heavy (3M, 6F)",
    players: [
      { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
      { name: "M3", gender: "MALE" },
      { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
      { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" },
      { name: "F5", gender: "FEMALE" }, { name: "F6", gender: "FEMALE" }
    ]
  }
];

// Enhanced batting order generation (same logic as in the app)
function generateEnhancedBattingOrder(attendingPlayers) {
  const males = attendingPlayers
    .filter(p => p.gender === 'MALE')
    .sort(() => Math.random() - 0.5);
  
  const females = attendingPlayers
    .filter(p => p.gender === 'FEMALE')
    .sort(() => Math.random() - 0.5);

  // If no females, just return all males
  if (females.length === 0) {
    return males;
  }

  // If no males, return all females (back-to-back is unavoidable)
  if (males.length === 0) {
    return females;
  }

  // Strategy: Ensure we have enough males to separate females
  const battingOrder = [];
  const remainingMales = [...males];
  const remainingFemales = [...females];

  // Pre-calculate: We need (females - 1) males minimum to separate all females
  // If we don't have enough males, some back-to-back is unavoidable
  const malesNeededToSeparateFemales = Math.max(0, females.length - 1);
  const canAvoidAllBackToBack = males.length >= malesNeededToSeparateFemales;

  while (remainingMales.length > 0 || remainingFemales.length > 0) {
    const lastPlayerGender = battingOrder.length > 0 ? 
      attendingPlayers.find(p => p.name === battingOrder[battingOrder.length - 1])?.gender : null;

    // Priority Rule: If last was female, MUST add male (if available)
    if (lastPlayerGender === 'FEMALE' && remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
      continue;
    }

    // Strategic decision: Should we add a female?
    if (remainingFemales.length > 0 && lastPlayerGender !== 'FEMALE') {
      // Check if we need to save males for future separation
      const femalesAfterThisOne = remainingFemales.length - 1;
      const malesNeededForSeparation = Math.max(0, femalesAfterThisOne - 1);
      const malesAvailableForSeparation = remainingMales.length;
      
      // Only add female if we'll have enough males left for separation
      const canAddFemale = malesAvailableForSeparation >= malesNeededForSeparation || 
                          !canAvoidAllBackToBack;

      if (canAddFemale) {
        battingOrder.push(remainingFemales.shift().name);
        continue;
      }
    }

    // Add male if available (either because we need to or by default)
    if (remainingMales.length > 0) {
      battingOrder.push(remainingMales.shift().name);
    } else if (remainingFemales.length > 0) {
      // Only females left - unavoidable back-to-back
      battingOrder.push(remainingFemales.shift().name);
    }
  }

  return battingOrder.map(name => attendingPlayers.find(p => p.name === name));
}

// Test function to check for violations
function checkBackToBackFemales(battingOrder) {
  const violations = [];
  
  for (let i = 0; i < battingOrder.length - 1; i++) {
    const current = battingOrder[i];
    const next = battingOrder[i + 1];
    
    if (current.gender === 'FEMALE' && next.gender === 'FEMALE') {
      violations.push(`Position ${i + 1}-${i + 2}: ${current.name} → ${next.name}`);
    }
  }
  
  return violations;
}

// Run tests
testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   Players: ${scenario.players.length} total (${scenario.players.filter(p => p.gender === 'MALE').length}M, ${scenario.players.filter(p => p.gender === 'FEMALE').length}F)`);
  
  // Run multiple iterations to test randomization
  let totalViolations = 0;
  let testRuns = 5;
  
  for (let run = 0; run < testRuns; run++) {
    const battingOrder = generateEnhancedBattingOrder(scenario.players);
    const violations = checkBackToBackFemales(battingOrder);
    
    if (run === 0) {
      // Show detailed results for first run
      console.log(`   Sample order: ${battingOrder.map(p => `${p.name}(${p.gender[0]})`).join(' → ')}`);
      if (violations.length > 0) {
        console.log(`   🚨 VIOLATIONS: ${violations.join(', ')}`);
      } else {
        console.log('   ✅ No back-to-back females');
      }
    }
    
    totalViolations += violations.length;
  }
  
  console.log(`   Summary: ${totalViolations} violations across ${testRuns} test runs`);
  
  // Special analysis for female-heavy scenario
  if (scenario.name.includes("Female heavy")) {
    console.log("   📝 Note: Some violations may be unavoidable when females outnumber males significantly");
  }
});

console.log("\n=== Test Complete ===");
