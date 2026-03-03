import {NextApiRequest, NextApiResponse} from "next";
import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";

const getMostActiveTenants = async (start: string, end: string) => {
    const sql = `
        SELECT t.id                            AS "id",
               t.name                          AS "name",
               COUNT(DISTINCT m."userId")::INT AS "activeUsers"
        FROM message AS m
                 JOIN tenant AS t ON t.id = m."tenantId"
        WHERE m."createdAt" >= $1
          AND m."createdAt" < $2
        GROUP BY t.id, t.name
        ORDER BY "activeUsers" DESC
        LIMIT 5;
    `

    const results = await db.query(sql, [start, end])
    return results.rows
}

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {
    const {start, end} = req.query

    const {valid, error} = validateDateRangeStrings(
        String(start),
        String(end)
    )

    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const adjustedEnd = addDayToDateString(String(end))
        const data = await getMostActiveTenants(String(start), adjustedEnd)
        return res.status(200).json(data)
    } catch (err: any) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
