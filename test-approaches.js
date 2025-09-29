// Show both approaches for handling 5M, 4F scenario
console.log("=== Comparing Two Approaches for 5M, 4F ===\n");

const testPlayers = [
  { name: "M1", gender: "MALE" }, { name: "M2", gender: "MALE" }, 
  { name: "M3", gender: "MALE" }, { name: "M4", gender: "MALE" }, 
  { name: "M5", gender: "MALE" },
  { name: "F1", gender: "FEMALE" }, { name: "F2", gender: "FEMALE" }, 
  { name: "F3", gender: "FEMALE" }, { name: "F4", gender: "FEMALE" }
];

// Approach 1: Strict no back-to-back females (may stack males at end)
function approachNoBackToBackFemales(players) {
  const males = players.filter(p => p.gender === 'MALE');
  const females = players.filter(p => p.gender === 'FEMALE');
  const order = [];
  const remainingM = [...males];
  const remainingF = [...females];

  while (remainingM.length > 0 || remainingF.length > 0) {
    const lastGender = order.length > 0 ? 
      players.find(p => p.name === order[order.length - 1])?.gender : null;

    if (lastGender === 'FEMALE' && remainingM.length > 0) {
      order.push(remainingM.shift().name);
    } else if (remainingF.length > 0 && lastGender !== 'FEMALE' && remainingM.length >= remainingF.length - 1) {
      order.push(remainingF.shift().name);
    } else if (remainingM.length > 0) {
      order.push(remainingM.shift().name);
    } else {
      order.push(remainingF.shift().name);
    }
  }

  return order.map(name => players.find(p => p.name === name));
}

// Approach 2: M-M-F pattern with minimal violations (may have back-to-back females)
function approachMMFPattern(players) {
  const males = players.filter(p => p.gender === 'MALE');
  const females = players.filter(p => p.gender === 'FEMALE');
  const order = [];
  const remainingM = [...males];
  const remainingF = [...females];

  while (remainingM.length > 0 || remainingF.length > 0) {
    // Add up to 2 males
    if (remainingM.length > 0) {
      order.push(remainingM.shift().name);
    }
    if (remainingM.length > 0 && order.length % 3 !== 2) {
      order.push(remainingM.shift().name);
    }
    
    // Add female
    if (remainingF.length > 0) {
      order.push(remainingF.shift().name);
    }
  }

  return order.map(name => players.find(p => p.name === name));
}

// Approach 3: Balanced distribution
function approachBalanced(players) {
  const males = players.filter(p => p.gender === 'MALE');
  const females = players.filter(p => p.gender === 'FEMALE');
  const order = [];
  
  // Interleave as much as possible: M-F-M-F-M-F-M-F-M
  const maxPairs = Math.min(males.length, females.length);
  
  for (let i = 0; i < maxPairs; i++) {
    if (i < males.length) order.push(males[i].name);
    if (i < females.length) order.push(females[i].name);
  }
  
  // Add remaining players
  for (let i = maxPairs; i < males.length; i++) {
    order.push(males[i].name);
  }
  for (let i = maxPairs; i < females.length; i++) {
    order.push(females[i].name);
  }

  return order.map(name => players.find(p => p.name === name));
}

function analyzeOrder(order, name) {
  const pattern = order.map(p => p.gender[0]).join('');
  
  // Count violations
  let backToBackF = 0;
  for (let i = 0; i < pattern.length - 1; i++) {
    if (pattern[i] === 'F' && pattern[i+1] === 'F') backToBackF++;
  }
  
  // Count males at end
  let malesAtEnd = 0;
  for (let i = pattern.length - 1; i >= 0; i--) {
    if (pattern[i] === 'M') malesAtEnd++;
    else break;
  }
  
  // Count M-M-F triplets
  let mmfCount = 0;
  for (let i = 0; i <= pattern.length - 3; i++) {
    if (pattern.substr(i, 3) === 'MMF') mmfCount++;
  }
  
  console.log(`${name}:`);
  console.log(`  Order: ${order.map(p => p.name).join('-')}`);
  console.log(`  Pattern: ${pattern}`);
  console.log(`  Back-to-back females: ${backToBackF}`);
  console.log(`  Males at end: ${malesAtEnd > 1 ? malesAtEnd : 'none'}`);
  console.log(`  M-M-F triplets: ${mmfCount}`);
  console.log();
}

// Test all approaches
const order1 = approachNoBackToBackFemales(testPlayers);
analyzeOrder(order1, "Approach 1: Strict no back-to-back females");

const order2 = approachMMFPattern(testPlayers);
analyzeOrder(order2, "Approach 2: Traditional M-M-F pattern");

const order3 = approachBalanced(testPlayers);
analyzeOrder(order3, "Approach 3: Balanced alternation");

console.log("Which approach do you prefer?");
console.log("1. Strict no back-to-back (may stack males)");
console.log("2. M-M-F pattern (may have back-to-back females)");
console.log("3. Balanced alternation (may stack males)");
