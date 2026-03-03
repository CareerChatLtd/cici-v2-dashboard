import {withAdminCheck} from "@/lib/auth-server";
import {db} from "@/lib/database";
import {createTenantValidator} from "@/lib/tenant";
import type {NextApiRequest, NextApiResponse} from "next";

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const shortSlugsResult = await db.query(`SELECT "shortSlug"
                                                FROM tenant
                                                WHERE "shortSlug" IS NOT NULL`)
    const existingShortSlugs = shortSlugsResult.rows.map((row: {shortSlug: string}) => row.shortSlug)

    const rawData = req.body

    // Trim all strings
    const trimmedData: Record<string, unknown> = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string')
            ? v.trim()
            : v
    })

    const validated: Record<string, unknown> = {}
    const errors: string[] = []

    // Validate data
    const validator = createTenantValidator({existingShortSlugs})
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
            errors.push((e as Error).message)
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
    const sql = `INSERT INTO tenant (${keys})
                 VALUES (${placeholders})
                 RETURNING *`

    try {
        const result = await db.query(sql, Object.values(validated))
        return res.status(200).json({data: result.rows[0]});
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(500).json({error: (err as Error).message})
    }
})
