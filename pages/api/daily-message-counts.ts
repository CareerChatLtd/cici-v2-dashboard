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
            WITH filtered_users(id) AS MATERIALIZED (${getFilteredUsersCte(req)}),
                 mm AS (SELECT m."sentOn"::date AS date,
                               COUNT(*)::int    AS ct
                        FROM msg_messages_relevant m
                                 JOIN filtered_users fu ON fu.id = m."authorId" -- semi-join
                        WHERE m."sentOn" >= $1
                          AND m."sentOn" < $2
                        GROUP BY 1)
            SELECT c.date,
                   COALESCE(mm.ct, 0) AS "totalMessages"
            FROM calendar_day c
                     LEFT JOIN mm ON mm.date = c.date
            WHERE c.date BETWEEN $1 AND $3
            ORDER BY c.date;
        `

        const result = await db.query(sql, [start, adjustedEnd, end])

        const data = result.rows;

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})