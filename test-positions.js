// Test script to verify position constraints are working correctly
const { players } = require("./app/data/players.ts");

// Mock the position mapping
const POSITION_MAP = {
  CATCHER: "Catcher",
  FIRST_BASE: "1B",
  SECOND_BASE: "2B",
  THIRD_BASE: "3B",
  SHORTSTOP: "SS",
  LEFT_FIELD: "LF",
  CENTER_FIELD: "CF",
  RIGHT_FIELD: "RF",
  ROVER: "Rover",
};

const FIELD_POSITIONS = [
  "Catcher",
  "1B",
  "2B",
  "3B",
  "Rover",
  "SS",
  "RF",
  "CF",
  "LF",
];

// Helper function to check if a player can play a specific position
const canPlayerPlayPosition = (player, position) => {
  // Check if position is in playablePositions
  const canPlayFromPlayable = player.playablePositions.some(
    (pos) => POSITION_MAP[pos] === position
  );

  // Check if position matches preferred position (only if not "none")
  const isPreferredPosition =
    player.preferredPosition !== "none" &&
    player.preferredPosition !== null &&
    (POSITION_MAP[player.preferredPosition] === position ||
      player.preferredPosition === position);

  return canPlayFromPlayable || isPreferredPosition;
};

// Test specific players
console.log("=== Position Constraint Test ===\n");

// Test Joleeza
console.log("JOLEEZA:");
console.log(
  "Can play positions:",
  players[0].playablePositions.map((p) => POSITION_MAP[p])
);
console.log("Preferred position:", players[0].preferredPosition);
FIELD_POSITIONS.forEach((pos) => {
  const canPlay = canPlayerPlayPosition(players[0], pos);
  console.log(`  ${pos}: ${canPlay ? "✅ YES" : "❌ NO"}`);
});

console.log("\nROSI:");
console.log(
  "Can play positions:",
  players[1].playablePositions.map((p) => POSITION_MAP[p])
);
console.log("Preferred position:", POSITION_MAP[players[1].preferredPosition]);
FIELD_POSITIONS.forEach((pos) => {
  const canPlay = canPlayerPlayPosition(players[1], pos);
  console.log(`  ${pos}: ${canPlay ? "✅ YES" : "❌ NO"}`);
});

console.log("\nDAN:");
const dan = players.find((p) => p.name === "Dan");
console.log(
  "Can play positions:",
  dan.playablePositions.map((p) => POSITION_MAP[p])
);
console.log("Preferred position:", POSITION_MAP[dan.preferredPosition]);
FIELD_POSITIONS.forEach((pos) => {
  const canPlay = canPlayerPlayPosition(dan, pos);
  console.log(`  ${pos}: ${canPlay ? "✅ YES" : "❌ NO"}`);
});

// Test position coverage
console.log("\n=== Position Coverage Analysis ===");
FIELD_POSITIONS.forEach((position) => {
  const playersForPosition = players.filter((player) =>
    canPlayerPlayPosition(player, position)
  );
  console.log(`${position}: ${playersForPosition.length} players can play`);
  console.log(`  Players: ${playersForPosition.map((p) => p.name).join(", ")}`);
});
