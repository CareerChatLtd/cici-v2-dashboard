import {validateDateRangeStrings} from "@/lib/dateUtils"
import {db} from "@/lib/database"
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";
import {topics} from "@/lib/topics";
import {legacyTopicMap} from "@/lib/legacyTopicMap";

const sql = `
    SELECT value
    FROM srv_kvs
    WHERE key BETWEEN $1 AND $2
`
export default withApiAuthRequired(async (req, res) => {

    const {tenantId, start, end} = req.query

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        await assertUserCanAccessTenant(tenantId, req, res);

        const keyBase = `stat_topic_count_${tenantId}`
        const startKey = `${keyBase}_${start}`
        const endKey = `${keyBase}_${end}`

        const result = await db.query(sql, [startKey, endKey])
        const rawData = result.rows.map(({value}) => JSON.parse(value))

        // Transform the data into a series of rows that's easier to work with
        const rowData = rawData.flatMap(data => Object.entries(data).map(([id, count]) => ({id, count})))

        // Replace any legacy topic IDs with the new ones
        const updatedData = rowData.map(({id, count}) => ({
            id: id in legacyTopicMap ? legacyTopicMap[id] : id,
            count,
        }))

        // Try to replace keys with human-readable names from our topics list
        const mappedData = updatedData.map(({id, count}) => ({
            name: id in topics ? topics[id].name : id,
            count,
        }));

        // Add up the counts for each topic
        const totals = mappedData.reduce((acc, {name, count}) => {
            acc[name] = (acc[name] || 0) + count
            return acc
        }, {})

        // Convert our object into a database-like array of objects
        const data = Object
            .entries(totals)
            .map(([name, count]) => ({name, count}))
            // Sort alphabetically first
            .sort((a, b) => -b.name.localeCompare(a.name))
            // Sort by count descending
            .sort((a, b) => -a.count + b.count)

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})