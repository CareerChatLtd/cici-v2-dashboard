import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant, getDefaultTenantId} from "@/lib/auth0";

export default withApiAuthRequired(async (req, res) => {

    // If no tenant has been supplied, use their default tenantId
    const tenantId = await (req.query?.tenantId || getDefaultTenantId(req, res))

    try {
        await assertUserCanAccessTenant(tenantId, req, res)
    } catch (err) {
        console.log(err.stack)
        return res.status(403).json({error: err.message})
    }

    const sql = `SELECT *
                 FROM cici.tenants
                 WHERE id = $1
                 LIMIT 1`;

    const [data] = (await db.query(sql, [tenantId])).rows;

    if (!data) {
        return res.status(403).json({error: 'You do not have access to this tenant'})
    }

    return res.status(200).json({data});
})
