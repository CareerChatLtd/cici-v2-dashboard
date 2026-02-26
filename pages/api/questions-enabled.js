import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";

export default withApiAuthRequired(async (req, res) => {
    const {tenantId} = req.query
    try {
        await assertUserCanAccessTenant(tenantId, req, res);

        const sql = `SELECT questions
                     FROM cici.tenants
                     WHERE id = $1
                     LIMIT 1`
        const result = await db.query(sql, [tenantId])
        const [{questions}] = result.rows
        return res.status(200).json({data: questions ?? []})
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
})
