import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";

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
            WITH filtered_users(id, created_at) AS MATERIALIZED (${getFilteredUsersCte(req)}),
                 daily_active AS (SELECT m."sentOn"::date    AS date,
                                         m."authorId"        AS user_id,
                                         DATE(fu.created_at) AS created_date
                                  FROM msg_messages_relevant AS m
                                           JOIN filtered_users AS fu ON fu.id = m."authorId"
                                  WHERE m."sentOn" >= $1
                                    AND m."sentOn" < $2
                                  GROUP BY 1, 2, 3 -- de-dupe by (date,user), third column to keep postgresql happy
                 )
            SELECT c.date,
                   COALESCE(COUNT(d.user_id), 0)::int                     AS "totalUsers",
                   COALESCE(SUM((d.created_date = c.date)::int), 0)::int  AS "newUsers",
                   COALESCE(SUM((d.created_date <> c.date)::int), 0)::int AS "existingUsers"
            FROM calendar_day c
                     LEFT JOIN daily_active d
                               ON d.date = c.date
            WHERE c.date BETWEEN $1 AND $3
            GROUP BY c.date
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