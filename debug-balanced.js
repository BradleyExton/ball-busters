// Debug the balanced scenario step by step
console.log("=== Debugging Balanced Scenario (5M, 4F) ===\n");

const players = [
  { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
  { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
  { name: "M5", gender: "MALE" },
  { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
  { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
];

const males = players.filter(p => p.gender === 'MALE');
const females = players.filter(p => p.gender === 'FEMALE');

console.log(`Males: ${males.length}, Females: ${females.length}`);
console.log(`Males needed to separate females: ${females.length - 1}`);
console.log(`Can avoid all back-to-back: ${males.length >= (females.length - 1)}`);

// Simulate the algorithm step by step
const battingOrder = [];
const remainingMales = [...males];
const remainingFemales = [...females];

const malesNeededToSeparateFemales = Math.max(0, females.length - 1);
const canAvoidAllBackToBack = males.length >= malesNeededToSeparateFemales;

console.log(`\nSimulating algorithm:`);
let step = 0;

while (remainingMales.length > 0 || remainingFemales.length > 0) {
  step++;
  const lastPlayerGender = battingOrder.length > 0 ? 
    players.find(p => p.name === battingOrder[battingOrder.length - 1])?.gender : null;

  console.log(`\nStep ${step}:`);
  console.log(`  Current order: [${battingOrder.join(', ')}]`);
  console.log(`  Remaining: ${remainingMales.length}M, ${remainingFemales.length}F`);
  console.log(`  Last player gender: ${lastPlayerGender || 'none'}`);

  // Priority Rule: If last was female, MUST add male (if available)
  if (lastPlayerGender === 'FEMALE' && remainingMales.length > 0) {
    const male = remainingMales.shift();
    battingOrder.push(male.name);
    console.log(`  → Added ${male.name} (PRIORITY: last was female)`);
    continue;
  }

  // Strategic decision: Should we add a female?
  if (remainingFemales.length > 0 && lastPlayerGender !== 'FEMALE') {
    // Check if we need to save males for future separation
    const femalesAfterThisOne = remainingFemales.length - 1;
    const malesNeededForSeparation = Math.max(0, femalesAfterThisOne - 1);
    const malesAvailableForSeparation = remainingMales.length;
    
    console.log(`  Strategic check:`);
    console.log(`    Females after adding this one: ${femalesAfterThisOne}`);
    console.log(`    Males needed for future separation: ${malesNeededForSeparation}`);
    console.log(`    Males available: ${malesAvailableForSeparation}`);
    
    // Only add female if we'll have enough males left for separation
    const canAddFemale = malesAvailableForSeparation >= malesNeededForSeparation || 
                        !canAvoidAllBackToBack;

    console.log(`    Can add female: ${canAddFemale}`);

    if (canAddFemale) {
      const female = remainingFemales.shift();
      battingOrder.push(female.name);
      console.log(`  → Added ${female.name} (strategic female placement)`);
      continue;
    }
  }

  // Add male if available (either because we need to or by default)
  if (remainingMales.length > 0) {
    const male = remainingMales.shift();
    battingOrder.push(male.name);
    console.log(`  → Added ${male.name} (default male placement)`);
  } else if (remainingFemales.length > 0) {
    // Only females left - unavoidable back-to-back
    const female = remainingFemales.shift();
    battingOrder.push(female.name);
    console.log(`  → Added ${female.name} (UNAVOIDABLE: only females left)`);
  }
}

console.log(`\n=== Final Result ===`);
console.log(`Order: ${battingOrder.join(' → ')}`);

// Check for violations
const violations = [];
for (let i = 0; i < battingOrder.length - 1; i++) {
  const current = players.find(p => p.name === battingOrder[i]);
  const next = players.find(p => p.name === battingOrder[i + 1]);
  
  if (current.gender === 'FEMALE' && next.gender === 'FEMALE') {
    violations.push(`Position ${i + 1}-${i + 2}: ${current.name} → ${next.name}`);
  }
}

if (violations.length > 0) {
  console.log(`🚨 VIOLATIONS: ${violations.join(', ')}`);
} else {
  console.log('✅ No back-to-back females');
}

console.log("\n=== Debug Complete ===");
