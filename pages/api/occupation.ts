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
            SELECT fu.attributes -> 'job' ->> 'soc'           AS "id",
                   MAX(fu.attributes -> 'job' ->> 'socTitle') AS "socTitle",
                   COUNT(DISTINCT fu.id)::integer AS "count"
            FROM filtered_users AS fu
            JOIN msg_messages_relevant m ON m."authorId" = fu.id
            WHERE m."sentOn" >= $1
              AND m."sentOn" < $2
              AND (fu.attributes -> 'job' ->> 'soc') IS NOT NULL
            GROUP BY fu.attributes -> 'job' ->> 'soc'
            order by "count" desc
            limit 10
        `

        const result = await db.query(sql, [start, adjustedEnd])

        const data = result.rows.map(({id, socTitle, count}) => ({
            id,
            name: socTitle,
            count
        }))

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})