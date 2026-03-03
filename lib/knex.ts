import type {Knex} from "knex";
import knexFactory from 'knex';

const {
    DB_CONNECTION_STRING: connectionString,
    DB_CA_CERT: certificate,
} = process.env

const config: Knex.Config = {
    client: 'pg',
    connection: {
        connectionString,
        ...(certificate && {
            ssl: {
                rejectUnauthorized: false,
                ca: certificate,
            },
        }),
    },
    searchPath: ['public'],
}

export const knex = knexFactory(config);
