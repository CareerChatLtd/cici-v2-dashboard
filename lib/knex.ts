import type {Knex} from "knex";
import knexFactory from 'knex';

const {
    DB_CONNECTION_STRING: connectionString,
} = process.env

const config: Knex.Config = {
    client: 'pg',
    connection: {
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
    searchPath: ['public'],
}

export const knex = knexFactory(config);
