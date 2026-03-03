import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";
import type {NextApiRequest, NextApiResponse} from "next";

const sql = `
    SELECT c.date                    AS date,
           COUNT(DISTINCT m.id)::INT AS "totalMessages"
    FROM "calendarDay" AS c
             LEFT JOIN
         message AS m
         ON
             DATE(m."createdAt") = c.date
    WHERE c.date BETWEEN $1 AND $2
    GROUP BY c.date
    ORDER BY date;
`

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const {start, end} = req.query as {start: string; end: string}

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const result = await db.query(sql, [start, end])

        const data = result.rows;

        return res.status(200).json(data)
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(500).json({error: (err as Error).message})
    }
})
