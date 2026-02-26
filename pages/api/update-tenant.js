import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";
import {db} from "@/lib/database";
import {createTenantValidator} from "@/lib/tenant";

export default withApiAuthRequired(async (req, res) => {

    const {tenantId = null} = req.query

    try {
        await assertUserCanAccessTenant(tenantId, req, res)
    } catch (err) {
        console.log(err.stack)
        return res.status(403).json({errors: [err.message]})
    }

    const questionsResult = await db.query(`SELECT unnest(enum_range(NULL::question))::varchar AS question ORDER BY question ASC`)
    const questions = questionsResult.rows.map(row => row.question)

    const shortIdsResult = await db.query(`SELECT "shortId"
                                                FROM cici.tenants
                                                WHERE "shortId" IS NOT NULL
                                                  AND id <> '${tenantId}'`)
    const existingShortIds = shortIdsResult.rows.map(row => row.shortId)

    const rawData = req.body

    // Trim all strings
    const trimmedData = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string')
            ? v.trim()
            : v
    })

    // Append ID
    trimmedData.id = tenantId

    const validated = {}
    const errors = []

    // Validate data
    const validators = createTenantValidator({questions, existingShortIds})
    Object.entries(trimmedData).forEach(([k, v]) => {
        try {
            // Reject anything that doesn't have a validator
            if (!Object.keys(validators).includes(k)) {
                throw new Error(`Unknown field "${k}" supplied`)
            }
            // Try validating - will throw an error if it fails
            validators[k](v)
            validated[k] = v
        } catch (e) {
            errors.push(e.message)
        }

    })
    if (errors.length) {
        return res.status(400).json({errors})
    }

    // Save data to database
    const keys = Object.keys(validated)
        .map(k => `"${k}"`)
        .join(',')

    const placeholders = Object.keys(validated)
        .map((_, i) => `$${i + 1}`)
        .join(',')
    const sql = `UPDATE cici.tenants
                 SET (${keys}) = (${placeholders})
                 WHERE id = '${tenantId}'
                 RETURNING *`

    try {
        const result = await db.query(sql, Object.values(validated))
        return res.status(200).json({data: result.rows[0]});
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({errors: [err.message]})
    }
})
