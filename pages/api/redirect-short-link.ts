import {NextApiRequest, NextApiResponse} from "next";
import {db} from "@/lib/database";
import {appBaseUrl} from "@/lib/shortLinks";

/**
 * This doesn't really belong in the Dashboard, but it's a convenient (and cheap) place to put a short link
 * redirect server.
 * Requests to cicichat.uk/* (for short IDs) and cicichat.uk/bot/* (for IDs) will be sent here from Cloudflare
 * which we then convert into the format expected by Botpress, over on bot.cicichat.co.uk.
 *
 * @see Cloudflare (cicichat.uk) > Rules > Page Rules
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {

    const {tenantId, shortId, instanceId} = req.query

    if (!tenantId && !shortId && !instanceId) {
        return res.status(400).json({message: 'Missing one of: tenantId, shortId, instanceId'})
    }

    const [sql, args] = instanceId ?
        [`SELECT tenants.id
          FROM cici.tenants
                   INNER JOIN cici.instances ON tenants.id = instances."tenantId"
          WHERE cici.instances.id = $1
            AND tenants.status <> 'archived'
          LIMIT 1`, [instanceId]]
        : [`SELECT id
            FROM cici.tenants
            WHERE status <> 'archived'
                AND id = $1
               OR "shortId" = $2
            LIMIT 1`, [tenantId, shortId]]

    const [tenant] = (await db.query(sql, args)).rows;

    if (!tenant) {
        return res.status(404).json({message: 'Tenant not found'})
    }

    const url = `${appBaseUrl}?tenantId=${tenant.id}` + (instanceId ? `&instanceId=${instanceId}` : '')

    return res.status(302).appendHeader('Location', url).end()
}
