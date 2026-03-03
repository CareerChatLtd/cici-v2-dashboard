import {addMonth, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";
import {withTenantCheck} from "@/lib/auth-server";


export default withTenantCheck(async (req, res) => {

    const {month: rawMonth, months = "1"} = req.query

    const month = String(rawMonth)
    const {valid, error} = validateMonthString(month);
    if (!valid) {
        return res.status(400).json({error: 'month: ' + error})
    }

    const monthCount = parseInt(String(months))
    if (monthCount > 12) {
        return res.status(400).json({error: 'months: Parameter must be no more than 12'})
    }

    const endMonth = addMonth(month, monthCount)

    const start = `${month}-01`
    const end = `${endMonth}-01`

    const sql = `
        WITH filtered_users AS MATERIALIZED (${getFilteredUsersCte(req)}),
             mm AS (SELECT date_trunc('month', m."createdAt")::date AS "monthStart",
                           COUNT(*)::int                            AS ct
                    FROM message m
                             JOIN filtered_users fu ON fu.id = m."userId"
                    WHERE m."createdAt" >= $1
                      AND m."createdAt" < $2
                    GROUP BY 1)
        SELECT TO_CHAR(c."monthStart", 'YYYY-MM') AS month,
               COALESCE(mm.ct, 0)                 AS "totalMessages"
        FROM "calendarMonth" c
                 LEFT JOIN mm ON mm."monthStart" = c."monthStart"
        WHERE c."monthStart" >= $1
          AND c."monthStart" <= $2
        ORDER BY c."monthStart";
    `

    try {
        const result = await db.query(sql, [start, end])

        const data = result.rows;

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
