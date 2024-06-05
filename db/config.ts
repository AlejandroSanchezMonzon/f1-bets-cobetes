import { column, defineDb } from "astro:db";

const User = {
  columns: {
    idUser: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    password: column.text(),
    isAdmin: column.boolean(),
  },
};

const Race = {
  columns: {
    idRace: column.number({ primaryKey: true, autoIncrement: true }),
    name: column.text(),
    initTime: column.date(),
    endTime: column.date(),
    type: column.text(),
  },
};

const Bet = {
  columns: {
    idBet: column.number({ primaryKey: true, autoIncrement: true }),
    idUser: column.number({ references: () => User.columns.idUser }),
    idRace: column.number({ references: () => Race.columns.idRace }),
    idPilot1: column.number({ references: () => Pilot.columns.idPilot }),
    idPilot2: column.number({ references: () => Pilot.columns.idPilot }),
    idPilot3: column.number({ references: () => Pilot.columns.idPilot }),
  },
};

const Result = {
  columns: {
    idResult: column.number({ primaryKey: true, autoIncrement: true }),
    idRace: column.number({ references: () => Race.columns.idRace, unique: true }),
    idPilot1: column.number({ references: () => Pilot.columns.idPilot }),
    idPilot2: column.number({ references: () => Pilot.columns.idPilot }),
    idPilot3: column.number({ references: () => Pilot.columns.idPilot }),
  },
};

const Pilot = {
  columns: {
    idPilot: column.number({ primaryKey: true, autoIncrement: true }),
    nombre: column.text(),
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