export interface Prediction {
    id: number;
    userId: number;
    raceWeekendId: number;
    sundayPredictedFirst: number;
    sundayPredictedSecond: number;
    sundayPredictedThird: number;
    sprintPredictedFirst?: number | null;
    sprintPredictedSecond?: number | null;
    sprintPredictedThird?: number | null;
    submissionTime: string;
    sundayPoints?: number;
    sprintPoints?: number;
    bonusPoints?: number;
    totalPoints?: number;
    deletedAt?: string | null;
  }
