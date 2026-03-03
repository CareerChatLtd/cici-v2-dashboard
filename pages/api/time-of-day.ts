import {withTenantCheck} from "@/lib/auth-server";
import {getQueryParam} from "@/lib/apiUtils";
import {db} from "@/lib/database";

const sql = `
    SELECT extract(HOUR from message."createdAt")::int as hour, count(*)::int as count
    FROM message
    WHERE message."tenantId" = $1
    GROUP BY 1
`

const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

export default withTenantCheck(async (req, res) => {

    const tenantId = getQueryParam(req, 'tenantId')

    try {
        const {rows} = await db.query(sql, [tenantId])

        // Find the max value in the results, which we can use to calculate the percentage for the other hours
        const [{count: max = 0} = {}] = rows.sort((a, b) => b.count - a.count)

        const data = hours.map(hour => {
            const result = rows.find(r => r.hour === hour)
            const count = result ? Number(result.count) : 0;
            const percent = max > 0 ? Math.round((count / max) * 100) : 0
            return {hour, count, percent}
        })
        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})