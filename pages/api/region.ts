import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
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
            WITH filtered_users(id, _, updated_at, attributes) AS MATERIALIZED (${getFilteredUsersCte(req)})
            SELECT attributes -> 'city' ->> 'region' AS "name",
                   COUNT(DISTINCT fu.id)::integer AS "count"
            FROM filtered_users fu
            JOIN msg_messages_relevant m ON m."authorId" = fu.id
            WHERE m."sentOn" >= $1
              AND m."sentOn" < $2
              AND (fu.attributes -> 'city' ->> 'region') IS NOT NULL
            GROUP BY fu.attributes -> 'city' ->> 'region'
            order by "count" desc
        `

        const result = await db.query(sql, [start, adjustedEnd])
        const rows: Array<{ name: string, count: number }> = result.rows
        const total = rows.reduce((total, row) => total + row.count, 0)

        const data = rows.map(({name, count}) => {
            const percent = Math.round(((count / total) * 100) * 100) / 100
            return {
                name,
                count,
                percent,
            }
        })

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})