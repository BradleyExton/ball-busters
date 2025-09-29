//Running speed is out of 5
//Hitting distance

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum POSITIONS {
  CATCHER = "CATCHER",
  FIRST_BASE = "FIRST_BASE",
  SECOND_BASE = "SECOND_BASE",
  THIRD_BASE = "THIRD_BASE",
  SHORTSTOP = "SHORTSTOP",
  LEFT_FIELD = "LEFT_FIELD",
  CENTER_FIELD = "CENTER_FIELD",
  RIGHT_FIELD = "RIGHT_FIELD",
  ROVER = "ROVER",
}

//softball players on team
export const players = [
  {
    // Female Players
    name: "joleeza",
    preferredPosition: POSITIONS.CATCHER,
    playablePositions: [
      POSITIONS.RIGHT_FIELD,
    ],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 2,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Rosi",
    preferredPosition: POSITIONS.FIRST_BASE,
    playablePositions: [POSITIONS.THIRD_BASE, POSITIONS.CATCHER],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 1,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Samantha",
    preferredPosition: POSITIONS.CATCHER,
    playablePositions: [POSITIONS.FIRST_BASE, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 2,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Madelaine",
    preferredPosition: POSITIONS.RIGHT_FIELD,
    playablePositions: [POSITIONS.LEFT_FIELD, POSITIONS.CATCHER],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 2,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Tay",
    preferredPosition: POSITIONS.SECOND_BASE,
    playablePositions: [POSITIONS.FIRST_BASE, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 2,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Bree",
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.SECOND_BASE,
      POSITIONS.THIRD_BASE,
      POSITIONS.FIRST_BASE,
      POSITIONS.SHORTSTOP
    ],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 3,
    pitchingPriority: 0, // Not a pitcher
  },
  // Male Players
  {
    name: "Dan",
    preferredPosition: POSITIONS.ROVER,
    playablePositions: [POSITIONS.CENTER_FIELD],
    gender: GENDER.MALE,
    hittingDistance: 5,
    runningSpeed: 5,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Dylan",
    preferredPosition: POSITIONS.THIRD_BASE,
    playablePositions: [POSITIONS.FIRST_BASE],
    gender: GENDER.MALE,
    hittingDistance: 3,
    runningSpeed: 2,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Bradley",
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.THIRD_BASE,
      POSITIONS.FIRST_BASE,
      POSITIONS.SECOND_BASE,
      POSITIONS.SHORTSTOP,
      POSITIONS.CENTER_FIELD,
      POSITIONS.LEFT_FIELD,
      POSITIONS.ROVER
    ],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Steve B",
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.LEFT_FIELD,
      POSITIONS.CENTER_FIELD,
      POSITIONS.RIGHT_FIELD,
      POSITIONS.CATCHER,
    ],
    gender: GENDER.MALE,
    hittingDistance: 3,
    runningSpeed: 5,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Darren",
    preferredPosition: POSITIONS.CENTER_FIELD,
    playablePositions: [POSITIONS.FIRST_BASE],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
    pitchingPriority: 1, // Primary pitcher
  },
  {
    name: "Matt",
    preferredPosition: POSITIONS.RIGHT_FIELD,
    playablePositions: [
      POSITIONS.LEFT_FIELD,
      POSITIONS.SHORTSTOP,
      POSITIONS.CENTER_FIELD,
      POSITIONS.ROVER,
      POSITIONS.RIGHT_FIELD,
    ],
    gender: GENDER.MALE,
    hittingDistance: 3,
    runningSpeed: 3,
    pitchingPriority: 0, // Not a pitcher
  },
  {
    name: "Kenny",
    preferredPosition: POSITIONS.SHORTSTOP,
    playablePositions: [POSITIONS.THIRD_BASE],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 3,
    pitchingPriority: 3, // Third priority pitcher (backup for Ryan)
  },
  {
    name: "Ryan",
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.LEFT_FIELD,
      POSITIONS.ROVER,
      POSITIONS.SHORTSTOP,
      POSITIONS.THIRD_BASE,
      POSITIONS.CENTER_FIELD,
      POSITIONS.FIRST_BASE,
      POSITIONS.SECOND_BASE
    ],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
    pitchingPriority: 2, // Second priority pitcher (backup for Darren)
  },
];
