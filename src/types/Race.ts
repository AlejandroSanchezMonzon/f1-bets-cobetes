export interface Race {
    idRace: string;
    name: string;
    initTime: Date;
    endTime: Date;
    type: RaceType;
}

export type RaceType = "normal" | "sprint"
