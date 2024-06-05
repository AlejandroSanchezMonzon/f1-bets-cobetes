import { column, defineDb } from "astro:db";

const User = {
  columns: {
    idUser: column.text({ primaryKey: true }),
    username: column.text(),
    email: column.text({ unique: true }),
    password: column.text(),
    isAdmin: column.boolean(),
  },
};

const Race = {
  columns: {
    idRace: column.text({ primaryKey: true }),
    name: column.text(),
    initTime: column.date(),
    endTime: column.date(),
    type: column.text(),
  },
};

const Bet = {
  columns: {
    idBet: column.text({ primaryKey: true, autoIncrement: true }),
    idUser: column.text({ references: () => User.columns.idUser }),
    idRace: column.text({ references: () => Race.columns.idRace }),
    idPilot1: column.text({ references: () => Pilot.columns.idPilot }),
    idPilot2: column.text({ references: () => Pilot.columns.idPilot }),
    idPilot3: column.text({ references: () => Pilot.columns.idPilot }),
  },
};

const Result = {
  columns: {
    idResult: column.text({ primaryKey: true, autoIncrement: true }),
    idRace: column.text({ references: () => Race.columns.idRace, unique: true }),
    idPilot1: column.text({ references: () => Pilot.columns.idPilot }),
    idPilot2: column.text({ references: () => Pilot.columns.idPilot }),
    idPilot3: column.text({ references: () => Pilot.columns.idPilot }),
  },
};

const Pilot = {
  columns: {
    idPilot: column.text({ primaryKey: true }),
    name: column.text(),
    team: column.text()
  },
};

export default defineDb({
  tables: {
    Users: User,
    Races: Race,
    Bets: Bet,
    Results: Result,
    Pilots: Pilot,
  },
});
