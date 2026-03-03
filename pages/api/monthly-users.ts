import {addMonth, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth-server";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";

type Row = { month: string, tenantId: string, newUsers: number, existingUsers: number, totalUsers: number }

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

    try {
        const sql = `
            WITH filtered_users(id, created_at) AS MATERIALIZED (${getFilteredUsersCte(req)})
            SELECT TO_CHAR(c."monthStart", 'YYYY-MM')                AS month,
                   COUNT(DISTINCT fu.id)::INT                        AS "totalUsers",
                   COUNT(DISTINCT CASE
                                      WHEN fu.created_at >= c."monthStart"
                                          THEN fu.id END)::INT       AS "newUsers",
                   COUNT(DISTINCT CASE
                                      WHEN fu.created_at < c."monthStart"
                                          THEN fu.id END)::INT       AS "existingUsers"
            FROM "calendarMonth" AS c
                     LEFT JOIN message AS m
                               ON m."createdAt" >= c."monthStart"
                               AND m."createdAt" < (c."monthStart"::DATE + INTERVAL '1 month')
                     LEFT JOIN filtered_users AS fu ON fu.id = m."userId"
            WHERE c."monthStart" >= $1
              AND c."monthStart" < $2
            GROUP BY c."monthStart"
            ORDER BY c."monthStart";
        `

        const result = await db.query(sql, [start, end])
        const data: Row[] = result.rows

        return res.status(200).json({data});

    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
