import {fileURLToPath} from "url";
import {db} from "./database";
import path from "path";

const fs = require('fs');
const csv = require('csv-parser');

const thisFilePath = fileURLToPath(import.meta.url)
const dataPath = path.join(thisFilePath, '..', '..', '/data/downloads')

/**
 * Adapted from the pg-escape package
 * @see https://github.com/segmentio/pg-escape/blob/master/index.js
 */
const escapeLiteral = (value:unknown): string => {
    if (value === null || value === undefined) {
        return 'NULL'
    }
    if (Array.isArray(value)) {
        const values = value.map(escapeLiteral)
        return "(" + values.join(", ") + ")"
    }
    if (typeof value !== "string") return '';
    const containsBackslash = value.includes('\\');
    // "E" tells PostgreSQL to use escape sequences
    const prefix = containsBackslash ? 'E' : '';
    const withSingleQuotesEscaped = value.replace(/'/g, "''");
    value = withSingleQuotesEscaped.replace(/\\/g, '\\\\');
    return prefix + "'" + value + "'";
};

const deliveryModes = {
    '1': 'classroom',
    '2': 'online',
    '3': 'work',
    '4': 'blended',
}

export function insertCourses() {
    return insertDataFromCSV(
        'course',
        path.join(dataPath, 'courses.csv'),
        {
            providerId: 'PROVIDER_UKPRN',
            name: 'COURSE_NAME',
            url: 'COURSE_URL',
            location: (csvRow) => ((csvRow.LOCATION_LONGITUDE as string).trim().length && (csvRow.LOCATION_LATITUDE as string).trim().length) ? `(${csvRow.LOCATION_LONGITUDE},${csvRow.LOCATION_LATITUDE})` : null,
            town: 'LOCATION_TOWN',
            deliveryMode: (csvRow) => deliveryModes[csvRow.DELIVER_MODE as string],
        });
}

export function insertProviders() {
    return insertDataFromCSV(
        'provider',
        path.join(dataPath, 'providers.csv'),
        {
            id: 'PROVIDER_UKPRN',
            name: 'PROVIDER_NAME',
        });
}

export type ColumnMapper = (csvRow:CsvRow) => string | null
export type CsvRow = Record<string, unknown>;
export type ColumnMap = Record<string, string | ColumnMapper>;

async function insertDataFromCSV(tableName:string, csvFilePath:string, columnMap: ColumnMap) {
    // Empty the existing contents
    await db.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY`);

    let data = []

    console.log(`${tableName}: Reading CSV...`);

    // Read the CSV file and insert data row by row
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .on('error', (error: unknown) => {
                reject(`${tableName}: Error reading CSV file: ${error}`);
            })
            .pipe(csv({
                mapHeaders: ({header}) => header.trim()
            }))
            .on('data', async (csvRow: CsvRow) => {
                const dbRow = Object
                    .fromEntries(Object
                        .entries(columnMap)
                        .map(([dbCol, source]) => {
                            if (typeof source === 'function') {
                                return [dbCol, source(csvRow)]
                            } else {
                                return [dbCol, csvRow[source]]
                            }
                        }))
                data.push(dbRow);
            })
            .on('end', async () => {
                // data = data.slice(0, 10000)

                console.log(`${tableName}: Record count = ${data.length}`);
                try {
                    const dbColumns = Object.keys(columnMap)
                    const dbColumnString = dbColumns.map(c => `"${c}"`).join(',')
                    // We're not using a parameterized query here as it's too slow
                    const values = data.map(
                        row => '(' + Object.values(row).map(escapeLiteral).join(',') + ')'
                    ).join(',')

                    await db.query(`INSERT INTO ${tableName} (${dbColumnString}) VALUES ${values} ON CONFLICT DO NOTHING`);

                    console.log(`${tableName}: Data insertion completed.`);
                    resolve(undefined)
                } catch (error) {
                    reject(`${tableName}: Error inserting data: ${error}`);
                }
            })
            .on('error', (error) => {
                reject(`${tableName}: Error: ${error}`);
            });
    })
}


