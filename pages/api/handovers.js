import {db} from "@/lib/database";
import {validateDateRangeStrings} from "@/lib/dateUtils";
import {DateTime} from "luxon";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";

const sql = `
    SELECT key, value :: smallint AS "count"
    FROM srv_kvs
    WHERE key BETWEEN $1 AND $2
    ORDER BY key
`

export default withApiAuthRequired(async (req, res) => {

    const {tenantId, start, end} = req.query

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    const keyBase = `stat_handover_count_${tenantId}`

    const startKey = `${keyBase}_${start}`
    const endKey = `${keyBase}_${end}`

    try {
        await assertUserCanAccessTenant(tenantId, req, res);

        const {rows} = await db.query(sql, [startKey, endKey])

        // Create list of all dates in range
        let cursor = start
        const allDays = {}
        while (cursor <= end) {
            allDays[cursor] = 0
            cursor = DateTime.fromISO(cursor).plus({day: 1}).toISODate()
        }

        // Translate db data to same format
        const daysWithData = rows.reduce((acc, {key, count}) => {
            const date = key.slice(-10)
            acc[date] = count
            return acc
        }, {})

        // Merge the placeholder data with any real collected data
        const data = Object.entries({...allDays, ...daysWithData}).map(([date, count]) => ({date, count}))

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})