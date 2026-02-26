import {NextApiRequest, NextApiResponse} from "next";
import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth";

const getMostActiveTenants = async (start: string, end: string) => {
    const sql = `
        SELECT u."tenantId"                     AS "tenantId",
               t.name                           AS "tenantName",
               COUNT(DISTINCT m."authorId")::INT AS "activeUsers"
        FROM msg_messages_relevant AS m
                 JOIN srv_channel_users AS u ON u.user_id::uuid = m."authorId"
                 LEFT JOIN cici.tenants AS t ON t.id = u."tenantId"
        WHERE m."authorId" IS NOT NULL
          AND m."sentOn" >= $1
          AND m."sentOn" < $2
        GROUP BY u."tenantId", t.name
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
        const data = await getMostActiveTenants(String(start), String(end))
        return res.status(200).json(data)
    } catch (err: any) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
