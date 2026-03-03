import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant, getUsersTenantSlug} from "@/lib/auth0";
import type {NextApiRequest, NextApiResponse} from "next";
import {Tenant} from "@/lib/types";

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    const tenantId = parseInt(String(req.query.tenantId));

    let data: Tenant;
    if (tenantId > 0) {
        const result = await db.query(
            `SELECT *
             FROM tenant
             WHERE id = $1
             LIMIT 1`, [tenantId]);
        data = result.rows[0];
    } else {
        const slug = await getUsersTenantSlug(req, res);
        const result = await db.query(
            `SELECT *
             FROM tenant
             WHERE slug = $1
             LIMIT 1`, [slug]);
        data = result.rows[0];
    }

    if (!data) {
        return res.status(404).json({error: 'Tenant not found'});
    }

    try {
        await assertUserCanAccessTenant(data.slug, req, res);
    } catch (err) {
        console.log((err as Error).stack);
        return res.status(403).json({error: (err as Error).message});
    }

    return res.status(200).json({data});
})
