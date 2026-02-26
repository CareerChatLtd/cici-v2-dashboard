import {withAdminCheck} from "@/lib/auth";
import {db} from "@/lib/database";
import {createTenantValidator} from "@/lib/tenant";

export default withAdminCheck(async (req, res) => {

    const questionsResult = await db.query(`SELECT unnest(enum_range(NULL::question))::varchar AS question ORDER BY question ASC`)
    const questions = questionsResult.rows.map(row => row.question)

    const shortIdsResult = await db.query(`SELECT "shortId"
                                                FROM cici.tenants
                                                WHERE "shortId" IS NOT NULL`)
    const existingShortIds = shortIdsResult.rows.map(row => row.shortId)

    const rawData = req.body

    // Trim all strings
    const trimmedData = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string')
            ? v.trim()
            : v
    })

    const validated = {}
    const errors = []

    // Validate data
    const validator = createTenantValidator({questions, existingShortIds})
    Object.entries(trimmedData).forEach(([k, v]) => {
        try {
            // Reject anything that doesn't have a validator
            if (!Object.keys(validator).includes(k)) {
                throw new Error(`Unknown field "${k}" supplied`)
            }
            // Try validating - will throw an error if it fails
            validator[k](v)
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
    const sql = `INSERT INTO cici.tenants (${keys})
                 VALUES (${placeholders})
                 RETURNING *`

    try {
        const result = await db.query(sql, Object.values(validated))
        return res.status(200).json({data: result.rows[0]});
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
