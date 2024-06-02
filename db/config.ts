import { column, defineDb } from "astro:db";

const Usuario = {
    columns: {
        id: column.text({ primaryKey: true }),
        nombre: column.text(),
        email: column.text({ unique: true }),
        contraseña: column.text(),
        esAdministrador: column.boolean(),
    },
};

const Piloto = {
    columns: {
        id: column.text({ primaryKey: true }),
        nombre: column.text(),
        nacionalidad: column.text(),
        equipo: column.text(),
    },
};

const GranPremio = {
    columns: {
        id: column.text({ primaryKey: true }),
        nombre: column.text(),
        fechaInicio: column.date(),
        fechaFin: column.date(),
        ubicacion: column.text(),
    },
};

const Carrera = {
    columns: {
        id: column.text({ primaryKey: true }),
        tipo: column.text(),
        fecha: column.date(),
        granPremioId: column.text({ references: () => GranPremio.columns.id }),
    },
};

const Porra = {
    columns: {
        id: column.text({ primaryKey: true }),
        usuarioId: column.text({ references: () => Usuario.columns.id }),
        carreraId: column.text({ references: () => Carrera.columns.id }),
        fecha: column.date(),
        puntosTotales: column.number({ default: 0 }),
    },
};

const PorraDetalle = {
    columns: {
        id: column.text({ primaryKey: true }),
        porraId: column.text({ references: () => Porra.columns.id }),
        posicion: column.number(),
        pilotoId: column.text({ references: () => Piloto.columns.id }),
    },
};

const ResultadoCarrera = {
    columns: {
        id: column.text({ primaryKey: true }),
        carreraId: column.text({ references: () => Carrera.columns.id }),
        posicion: column.number(),
        pilotoId: column.text({ references: () => Piloto.columns.id }),
    },
};

// https://astro.build/db/config
export default defineDb({
    tables: {
        Usuario,
        Piloto,
        GranPremio,
        Carrera,
        Porra,
        PorraDetalle,
        ResultadoCarrera,
    },
});
