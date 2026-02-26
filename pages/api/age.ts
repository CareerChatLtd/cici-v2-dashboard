import {db} from "@/lib/database";
import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {ageBrackets} from "@/lib/ages";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";
import {withTenantCheck} from "@/lib/auth";

export default withTenantCheck(async (req, res) => {

    const {start: rawStart, end: rawEnd} = req.query

    const start = String(rawStart)
    const end = String(rawEnd)

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const adjustedEnd = addDayToDateString(end)

        const sql = `
            WITH filtered_users(id, created_at, updated_at, _, age) AS MATERIALIZED (${getFilteredUsersCte(req)})
            SELECT age, COUNT(DISTINCT fu.id)::integer AS "count"
            FROM filtered_users fu
            JOIN msg_messages_relevant m ON m."authorId" = fu.id
            WHERE m."sentOn" >= $1
              AND m."sentOn" < $2
            GROUP BY age
        `

        const result = await db.query(sql, [start, adjustedEnd])
        const rows: Array<{ age: number | null, count: number }> = result.rows
        const total = rows.reduce((total, row) => total + row.count, 0)

        const data = ageBrackets.map(({name, minAge, maxAge}) => {
            const relevantRows = rows.filter(row => row.age && row.age >= minAge && row.age <= maxAge)
            const count = relevantRows.reduce((total, row) => total + row.count, 0)
            const percent = count === 0 ? 0 : Math.round(((count / total) * 100) * 100) / 100
            return {name, count, percent}
        })

        // Add in counts for users of unknown age
        const unknownAgeRows = rows.filter(row => row.age === null)
        const unknownAgeCount = unknownAgeRows.reduce((total, row) => total + row.count, 0)
        const unknownAgePercent = unknownAgeCount === 0 ? 0 : Math.round(((unknownAgeCount / total) * 100) * 100) / 100
        data.unshift({name: 'Unknown', count: unknownAgeCount, percent: unknownAgePercent})

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
