import {addMonth, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";
import type {NextApiRequest, NextApiResponse} from "next";

const sql = `
    SELECT TO_CHAR(DATE_TRUNC('month', c."monthStart"), 'YYYY-MM') AS month,
           COUNT(DISTINCT m.id)::INT AS "totalMessages"
    FROM "calendarMonth" AS c
             LEFT JOIN
         message AS m
         ON
             DATE_TRUNC('month', m."createdAt") = c."monthStart"
    WHERE c."monthStart" >= $1
      AND c."monthStart" < $2
    GROUP BY c."monthStart"
    ORDER BY c."monthStart";
`

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const {month, months = "1"} = req.query as {month: string; months?: string}

    const {valid, error} = validateMonthString(month);
    if (!valid) {
        return res.status(400).json({error: 'month: ' + error})
    }

    const monthCount = parseInt(months)

    if (monthCount > 12) {
        return res.status(400).json({error: 'months: Parameter must be no more than 12'})
    }

    const endMonth = addMonth(month, monthCount)

    const start = `${month}-01`
    const end = `${endMonth}-01`

    try {
        const result = await db.query(sql, [start, end])

        const data = result.rows;

        return res.status(200).json(data)
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(500).json({error: (err as Error).message})
    }
})
