import {addMonth, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";
import {NextApiRequest, NextApiResponse} from "next";

interface Row {
    month: string,
    newUsers: number,
    existingUsers: number,
    totalUsers: number
}

/**
 * @param startDate - YYYY-MM-DD
 * @param endDate - YYYY-MM-DD exclusive - should be the first day of the excluded month
 */
const getCounts = async (startDate: string, endDate: string): Promise<Row[]> => {
    const sql = `
        SELECT TO_CHAR(c."monthStart", 'YYYY-MM')                           AS month,
               COUNT(DISTINCT u."id")::INT                                   AS "totalUsers",
               COUNT(DISTINCT CASE
                                  WHEN u."createdAt" >= c."monthStart"
                                      THEN u."id" END)::INT                  AS "newUsers",
               COUNT(DISTINCT CASE
                                  WHEN u."createdAt" < c."monthStart"
                                      THEN u."id" END)::INT                  AS "existingUsers"
        FROM "calendarMonth" AS c
                 LEFT JOIN message AS m
                           ON m."createdAt" >= c."monthStart"
                               AND m."createdAt" < (c."monthStart"::DATE + INTERVAL '1 month')
                 LEFT JOIN "user" AS u ON u."id" = m."userId"
        WHERE c."monthStart" >= $1
          AND c."monthStart" < $2
        GROUP BY c."monthStart"
        ORDER BY c."monthStart";
    `

    const results = await db.query(sql, [startDate, endDate])
    return results.rows
}

/**
 * This report is only used for internal reporting purposes, so it doesn't include things like the ability to filter
 * by custom question responses.
 */
export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const {month: rawMonth, months: monthCountRaw = "1", format = 'json'} = req.query

    const month = String(rawMonth)
    const {valid, error} = validateMonthString(month);
    if (!valid) {
        return res.status(400).json({error: 'month: ' + error})
    }

    const monthCount = parseInt(String(monthCountRaw))
    if (monthCount > 12) {
        return res.status(400).json({error: 'months: Parameter must be no more than 12'})
    }

    try {
        const startDate = `${month}-01`
        const endDate = `${addMonth(month, monthCount)}-01`

        const data = await getCounts(startDate, endDate)

        if (format === 'json') {
            return res.status(200).json({data});
        } else if (format === 'tsv') {
            const header = ['Month', 'New Users', 'Existing Users', 'Total Users'].join("\t");
            const rows = data.map(o => Object.values(o).join("\t"))
            return res.status(200)
                .setHeader('Content-Type', 'text/tab-separated-values')
                .send(header + "\n" + rows.join("\n"))
        } else {
            return res.status(400).json({error: 'This format not supported. Choose from "json" or "tsv".'})
        }
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
