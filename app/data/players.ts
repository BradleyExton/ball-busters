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
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.CATCHER,
      POSITIONS.FIRST_BASE,
      POSITIONS.SECOND_BASE,
      POSITIONS.THIRD_BASE,
      POSITIONS.ROVER,
    ],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 2,
  },
  {
    name: "Rosi",
    preferredPosition: POSITIONS.FIRST_BASE,
    playablePositions: [POSITIONS.CATCHER, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 1,
  },
  {
    name: "Samantha",
    preferredPosition: POSITIONS.CATCHER,
    playablePositions: [POSITIONS.FIRST_BASE, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 2,
  },
  {
    name: "Madelaine",
    preferredPosition: POSITIONS.RIGHT_FIELD,
    playablePositions: [POSITIONS.FIRST_BASE, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 1,
    runningSpeed: 2,
  },
  {
    name: "Tay",
    preferredPosition: POSITIONS.SECOND_BASE,
    playablePositions: [POSITIONS.FIRST_BASE, POSITIONS.THIRD_BASE],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 2,
  },
  {
    name: "Bree",
    preferredPosition: POSITIONS.SECOND_BASE,
    playablePositions: [
      POSITIONS.FIRST_BASE,
      POSITIONS.CATCHER,
      POSITIONS.THIRD_BASE,
      POSITIONS.RIGHT_FIELD,
    ],
    gender: GENDER.FEMALE,
    hittingDistance: 2,
    runningSpeed: 3,
  },
  // Male Players
  {
    name: "Dan",
    preferredPosition: POSITIONS.ROVER,
    playablePositions: [POSITIONS.LEFT_FIELD, POSITIONS.RIGHT_FIELD],
    gender: GENDER.MALE,
    hittingDistance: 5,
    runningSpeed: 5,
  },
  {
    name: "Dylan",
    preferredPosition: POSITIONS.THIRD_BASE,
    playablePositions: [POSITIONS.RIGHT_FIELD, POSITIONS.FIRST_BASE],
    gender: GENDER.MALE,
    hittingDistance: 3,
    runningSpeed: 2,
  },
  {
    name: "Bradley",
    preferredPosition: POSITIONS.ROVER,
    playablePositions: [
      POSITIONS.LEFT_FIELD,
      POSITIONS.SHORTSTOP,
      POSITIONS.CENTER_FIELD,
    ],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
  },
  {
    name: "Steve B",
    preferredPosition: "none",
    playablePositions: [
      POSITIONS.LEFT_FIELD,
      POSITIONS.SHORTSTOP,
      POSITIONS.CENTER_FIELD,
      POSITIONS.ROVER,
      POSITIONS.RIGHT_FIELD,
      POSITIONS.CATCHER,
    ],
    gender: GENDER.MALE,
    hittingDistance: 3,
    runningSpeed: 5,
  },
  {
    name: "Darren",
    preferredPosition: POSITIONS.CENTER_FIELD,
    playablePositions: [POSITIONS.FIRST_BASE],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
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
  },
  {
    name: "Kenny",
    preferredPosition: POSITIONS.SHORTSTOP,
    playablePositions: [POSITIONS.LEFT_FIELD, POSITIONS.THIRD_BASE],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 3,
  },
  {
    name: "Ryan",
    preferredPosition: POSITIONS.LEFT_FIELD,
    playablePositions: [
      POSITIONS.ROVER,
      POSITIONS.SHORTSTOP,
      POSITIONS.CENTER_FIELD,
    ],
    gender: GENDER.MALE,
    hittingDistance: 4,
    runningSpeed: 4,
  },
];
