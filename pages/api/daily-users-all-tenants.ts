import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth";
import {NextApiRequest, NextApiResponse} from "next";

interface Row {
    date: string;
    totalUsers: number;
    newUsers: number;
    existingUsers: number;
}

/**
 * Get daily user counts across all tenants for admin reporting.
 * This report is only used for internal reporting purposes.
 */
export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const {start: rawStart, end: rawEnd} = req.query

    const start = String(rawStart)
    const end = String(rawEnd)

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const sql = `
            SELECT c.date,
                   COUNT(DISTINCT u.user_id)::INT AS "totalUsers",
                   COUNT(DISTINCT CASE
                                      WHEN u.created_at >= c.date
                                          THEN u.user_id END)::INT AS "newUsers",
                   COUNT(DISTINCT CASE
                                      WHEN u.created_at < c.date
                                          THEN u.user_id END)::INT AS "existingUsers"
            FROM calendar_day AS c
                     LEFT JOIN msg_messages_relevant AS m
                               ON m."sentOn" >= c.date
                               AND m."sentOn" < c.date + INTERVAL '1 day'
                     LEFT JOIN srv_channel_users AS u ON u.user_id::uuid = m."authorId"
            WHERE c.date BETWEEN $1 AND $2
            GROUP BY c.date
            ORDER BY c.date;
        `
        const result = await db.query(sql, [start, end])

        const data: Row[] = result.rows;

        return res.status(200).json(data)
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
