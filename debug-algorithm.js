// Debug the algorithm step by step with 5M, 4F
console.log("=== Debugging Algorithm ===\n");

const testPlayers = [
  { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
  { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
  { name: "M5", gender: "MALE" },
  { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
  { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
];

console.log("Input: 5M, 4F");
console.log("Expected result: Need to avoid back-to-back F, but mathematically we must either:");
console.log("  - Stack males at end (M-M-F-M-M-F-M-F-M-M), or");
console.log("  - Have back-to-back females somewhere");
console.log();

// Simulate the algorithm
const males = testPlayers.filter(p => p.gender === 'MALE');
const females = testPlayers.filter(p => p.gender === 'FEMALE');

console.log("Step 1: Build M-M-F pattern");
let battingOrder = [];
const workingMales = [...males];
const workingFemales = [...females];

while (workingMales.length > 0 || workingFemales.length > 0) {
  // Add up to 2 males
  if (workingMales.length > 0) {
    battingOrder.push(workingMales.shift().name);
  }
  if (workingMales.length > 0 && battingOrder.length % 3 !== 2) {
    battingOrder.push(workingMales.shift().name);
  }
  
  // Add female
  if (workingFemales.length > 0) {
    battingOrder.push(workingFemales.shift().name);
  }
}

console.log("Initial M-M-F pattern:", battingOrder.join('-'));

// Check for back-to-back females
function checkBackToBack(order) {
  const violations = [];
  for (let i = 0; i < order.length - 1; i++) {
    const current = testPlayers.find(p => p.name === order[i]);
    const next = testPlayers.find(p => p.name === order[i + 1]);
    if (current.gender === 'FEMALE' && next.gender === 'FEMALE') {
      violations.push({index: i, names: [current.name, next.name]});
    }
  }
  return violations;
}

let violations = checkBackToBack(battingOrder);
console.log("Back-to-back violations:", violations.length > 0 ? violations : "none");

// Try to fix violations
if (violations.length > 0) {
  console.log("\nStep 2: Attempt to fix violations by swapping");
  
  for (const violation of violations) {
    console.log(`Trying to fix: ${violation.names[0]} → ${violation.names[1]} at position ${violation.index}`);
    
    // Look for a male to swap with
    let swapped = false;
    for (let j = violation.index + 2; j < Math.min(violation.index + 5, battingOrder.length); j++) {
      const candidate = testPlayers.find(p => p.name === battingOrder[j]);
      if (candidate.gender === 'MALE') {
        console.log(`  Swapping ${battingOrder[violation.index + 1]} with ${battingOrder[j]}`);
        [battingOrder[violation.index + 1], battingOrder[j]] = [battingOrder[j], battingOrder[violation.index + 1]];
        swapped = true;
        break;
      }
    }
    
    if (!swapped) {
      console.log("  No suitable male found to swap with");
    }
  }
  
  console.log("After swapping:", battingOrder.join('-'));
  violations = checkBackToBack(battingOrder);
  console.log("Remaining violations:", violations.length > 0 ? violations : "none");
}

// Final analysis
const pattern = battingOrder.map(name => testPlayers.find(p => p.name === name).gender[0]).join('');
console.log("\nFinal analysis:");
console.log("Pattern:", pattern);
console.log("Males at end:", pattern.match(/M+$/)?.[0]?.length || 0);
console.log("Back-to-back F:", (pattern.match(/FF/g) || []).length);

console.log("\n=== Debug Complete ===");
