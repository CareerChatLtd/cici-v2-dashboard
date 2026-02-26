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
            WITH filtered_users(id, created_at) AS MATERIALIZED (${getFilteredUsersCte(req)})
            SELECT count(DISTINCT fu.id)::INT                  AS "totalUsers",
                   count(DISTINCT CASE
                                      WHEN fu.created_at >= $1 AND fu.created_at < $2
                                          THEN fu.id END)::INT as "newUsers",
                   count(DISTINCT CASE
                                      WHEN fu.created_at < $1
                                          THEN fu.id END)::INT as "existingUsers"
            FROM msg_messages_relevant as m
                     JOIN filtered_users AS fu
                          ON fu.id = m."authorId"
            WHERE m."authorId" IS NOT NULL
              AND m."sentOn" >= $1
              AND m."sentOn" < $2
            ;
        `

        const result = await db.query(sql, [start, adjustedEnd])
        const data = result.rows[0]

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
