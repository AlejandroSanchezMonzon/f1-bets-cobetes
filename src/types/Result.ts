export interface Result {
    raceWeekendId: number;
    sundayFirst: number;
    sundaySecond: number;
    sundayThird: number;
    sprintFirst?: number | null;
    sprintSecond?: number | null;
    sprintThird?: number | null;
    deletedAt?: string | null;
  }
