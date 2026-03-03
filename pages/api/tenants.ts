import {db} from "@/lib/database";
import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import {Auth0User, getTenantSlugsForLoggedInUser, isUserAdmin} from "@/lib/auth0";
import type {NextApiRequest, NextApiResponse} from "next";

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    const user = session?.user as Auth0User;

    if (isUserAdmin(user)) {
        // Admin users see all tenants
        const sql = `SELECT id, name, slug, status
                     FROM tenant
                     WHERE status <> 'archived'
                     ORDER BY lower(name)`

        const data = (await db.query(sql)).rows;
        return res.status(200).json({data});
    } else {
        // Non-admin users only see their accessible tenants
        const userTenantSlugs = getTenantSlugsForLoggedInUser(user);

        if (userTenantSlugs.length === 0) {
            return res.status(403).json({error: 'User has no accessible tenants'});
        }

        const sql = `SELECT id, name, slug, status
                     FROM tenant
                     WHERE status <> 'archived'
                       AND slug = ANY ($1)
                     ORDER BY lower(name)`

        const data = (await db.query(sql, [userTenantSlugs])).rows;
        return res.status(200).json({data});
    }
})
