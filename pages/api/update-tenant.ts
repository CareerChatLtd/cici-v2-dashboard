import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";
import {db} from "@/lib/database";
import {createTenantValidator} from "@/lib/tenant";
import type {NextApiRequest, NextApiResponse} from "next";

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {

    const {tenantId = null} = req.query

    const numericTenantId = Number(tenantId)
    if (isNaN(numericTenantId)) {
        return res.status(400).json({errors: ['tenantId must be a number']})
    }

    // Resolve numeric ID to slug for Auth0 access check
    const tenantLookup = await db.query('SELECT slug FROM tenant WHERE id = $1', [numericTenantId])
    const tenantSlug = tenantLookup.rows[0]?.slug
    if (!tenantSlug) {
        return res.status(404).json({errors: ['Tenant not found']})
    }

    try {
        await assertUserCanAccessTenant(tenantSlug, req, res)
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(403).json({errors: [(err as Error).message]})
    }

    const shortSlugsResult = await db.query(`SELECT "shortSlug"
                                                FROM tenant
                                                WHERE "shortSlug" IS NOT NULL
                                                  AND id <> $1`, [numericTenantId])
    const existingShortSlugs = shortSlugsResult.rows.map((row: {shortSlug: string}) => row.shortSlug)

    const rawData = req.body

    // Trim all strings
    const trimmedData: Record<string, unknown> = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string')
            ? v.trim()
            : v
    })

    // Append slug as the identifier
    trimmedData.slug = tenantSlug

    const validated: Record<string, unknown> = {}
    const errors: string[] = []

    // Validate data
    const validators = createTenantValidator({existingShortSlugs})
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
    const sql = `UPDATE tenant
                 SET (${keys}) = (${placeholders})
                 WHERE id = $${Object.keys(validated).length + 1}
                 RETURNING *`

    try {
        const result = await db.query(sql, [...Object.values(validated), numericTenantId])
        return res.status(200).json({data: result.rows[0]});
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(500).json({errors: [(err as Error).message]})
    }
})
