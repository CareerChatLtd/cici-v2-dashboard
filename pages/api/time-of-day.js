import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";

const sql = `
    SELECT key, value :: smallint AS "count"
    FROM srv_kvs
    WHERE key LIKE 'stat_hour_count_' || $1 || '_%'
    ORDER BY key
`

const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

export default withApiAuthRequired(async (req, res) => {

    const {tenantId} = req.query

    try {
        await assertUserCanAccessTenant(tenantId, req, res);

        const {rows} = await db.query(sql, [tenantId])

        const results = rows.map(({key, count}) => {
            // Extract the hour from the KVS key
            const hour = Number(key.split('_').pop())
            return {hour, count}
        })

        // Find the max value in the results, which we can use to calculate the percentage for the other hours
        const [{count: max = 0} = {}] = results.sort((a, b) => b.count - a.count)

        const data = hours.map(hour => {
            const result = results.find(r => r.hour === hour)
            const count = result ? Number(result.count) : 0;
            const percent = Math.round((count / max) * 100)
            return {hour, count, percent}
        })
        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})