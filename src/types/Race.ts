export interface RaceWeekend {
    id: number;
    roundNumber: number;
    raceDate: string;
    raceName: string;
    raceType: 'gp' | 'sprint';
    createdAt: string;
    deletedAt?: string | null;
  }
