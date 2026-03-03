import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";
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
                   COUNT(DISTINCT u."id")::INT AS "totalUsers",
                   COUNT(DISTINCT CASE
                                      WHEN u."createdAt" >= c.date
                                          THEN u."id" END)::INT AS "newUsers",
                   COUNT(DISTINCT CASE
                                      WHEN u."createdAt" < c.date
                                          THEN u."id" END)::INT AS "existingUsers"
            FROM "calendarDay" AS c
                     LEFT JOIN message AS m
                               ON m."createdAt" >= c.date
                               AND m."createdAt" < c.date + INTERVAL '1 day'
                     LEFT JOIN "user" AS u ON u."id" = m."userId"
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
