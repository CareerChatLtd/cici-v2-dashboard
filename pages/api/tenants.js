import {db} from "@/lib/database";
import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import {getTenantIdsForLoggedInUser, isUserAdmin} from "@/lib/auth0";

export default withApiAuthRequired(async (req, res) => {
    const {user} = await getSession(req, res);

    if (isUserAdmin(user)) {
        // Admin users see all tenants
        const sql = `SELECT name, id, status
                     FROM cici.tenants
                     WHERE status <> 'archived'
                     ORDER BY lower(name)`

        const data = (await db.query(sql)).rows;
        return res.status(200).json({data});
    } else {
        // Non-admin users only see their accessible tenants
        const userTenantIds = getTenantIdsForLoggedInUser(user);

        if (userTenantIds.length === 0) {
            return res.status(403).json({error: 'User has no accessible tenants'});
        }

        const sql = `SELECT name, id, status
                     FROM cici.tenants
                     WHERE status <> 'archived'
                       AND id = ANY ($1)
                     ORDER BY lower(name)`

        const data = (await db.query(sql, [userTenantIds])).rows;
        return res.status(200).json({data});
    }
})
