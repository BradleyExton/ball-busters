// Test with real Ball Busters team data
console.log("=== Real Team Test ===\n");

// Real team players (simplified for testing)
const realTeam = [
  // Males
  { name: "Darren", gender: "MALE" },
  { name: "Ryan", gender: "MALE" },
  { name: "Kenny", gender: "MALE" },
  { name: "Dan", gender: "MALE" },
  { name: "Bradley", gender: "MALE" },
  { name: "Ronnie", gender: "MALE" },
  { name: "Owen", gender: "MALE" },
  // Females  
  { name: "Rosi", gender: "FEMALE" },
  { name: "Samantha", gender: "FEMALE" },
  { name: "Tay", gender: "FEMALE" },
  { name: "Bree", gender: "FEMALE" },
  { name: "Cynthia", gender: "FEMALE" },
  { name: "Holly", gender: "FEMALE" },
  { name: "Ashley", gender: "FEMALE" }
];

console.log(`Total players: ${realTeam.length}`);
console.log(`Males: ${realTeam.filter(p => p.gender === 'MALE').length}`);
console.log(`Females: ${realTeam.filter(p => p.gender === 'FEMALE').length}`);

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

// Test with different attendance scenarios
const scenarios = [
  {
    name: "Full team attendance", 
    attending: realTeam
  },
  {
    name: "Typical game (9 players: 5M, 4F)",
    attending: [
      { name: "Darren", gender: "MALE" },
      { name: "Ryan", gender: "MALE" },
      { name: "Kenny", gender: "MALE" },
      { name: "Dan", gender: "MALE" },
      { name: "Bradley", gender: "MALE" },
      { name: "Rosi", gender: "FEMALE" },
      { name: "Samantha", gender: "FEMALE" },
      { name: "Tay", gender: "FEMALE" },
      { name: "Bree", gender: "FEMALE" }
    ]
  },
  {
    name: "Female heavy game (4M, 6F)",
    attending: [
      { name: "Darren", gender: "MALE" },
      { name: "Ryan", gender: "MALE" },
      { name: "Kenny", gender: "MALE" },
      { name: "Dan", gender: "MALE" },
      { name: "Rosi", gender: "FEMALE" },
      { name: "Samantha", gender: "FEMALE" },
      { name: "Tay", gender: "FEMALE" },
      { name: "Bree", gender: "FEMALE" },
      { name: "Cynthia", gender: "FEMALE" },
      { name: "Holly", gender: "FEMALE" }
    ]
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  const males = scenario.attending.filter(p => p.gender === 'MALE').length;
  const females = scenario.attending.filter(p => p.gender === 'FEMALE').length;
  console.log(`   Players: ${scenario.attending.length} total (${males}M, ${females}F)`);
  
  const battingOrder = generateEnhancedBattingOrder(scenario.attending);
  const violations = checkBackToBackFemales(battingOrder);
  
  console.log(`   Order: ${battingOrder.map(p => `${p.name}(${p.gender[0]})`).join(' → ')}`);
  
  if (violations.length > 0) {
    console.log(`   🚨 VIOLATIONS: ${violations.join(', ')}`);
  } else {
    console.log('   ✅ No back-to-back females');
  }
  
  // Theoretical analysis
  const malesNeeded = Math.max(0, females - 1);
  const canAvoidAll = males >= malesNeeded;
  console.log(`   📊 Analysis: Need ${malesNeeded} males to separate ${females} females, have ${males} males → ${canAvoidAll ? 'Should be avoidable' : 'Some violations unavoidable'}`);
});

console.log("\n=== Real Team Test Complete ===");
