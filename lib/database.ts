import {Pool, types} from 'pg'

const {
    DB_CONNECTION_STRING: connectionString,
    DB_CA_CERT: certificate,
} = process.env


// Always return date columns as date strings, not Date objects or timestamps
types.setTypeParser(1082, (val) => val); // Keeps dates as 'YYYY-MM-DD' strings

const db = new Pool({
    connectionString,
    ...(certificate && {
        ssl: {
            rejectUnauthorized: false,
            ca: certificate,
        },
    }),
})

db.on('connect', async client => {
    await client.query("SET search_path TO public;");
})

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

export {
    db,
}
