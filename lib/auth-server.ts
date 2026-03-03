import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';
import {assertUserCanAccessTenant, assertUserIsAdmin} from './auth0';
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {getQueryParam} from "./apiUtils";
import {db} from "./database";

/**
 * Wrap an API Route to check that the user has access to this tenant's data.
 * If they're not logged in the handler will return a 401 Unauthorized.
 * If they don't have access to this tenant, then the handler will return a 403 Forbidden.
 *
 * ```js
 * // pages/api/protected-route.js
 * import { withTenantCheck } from 'lib/auth-server';
 *
 * export default withTenantCheck(function ProtectedRoute(req, res) {
 *   ...
 * });
 * ```
 *
 * If you visit `/api/protected-route` without a valid session cookie, you will get a 401 response.
 *
 * @category Server
 */
export const withTenantCheck = (apiRoute: NextApiHandler) => withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {

    const rawTenantId = getQueryParam(req, 'tenantId')

    // Resolve numeric tenant ID to slug for Auth0 access check
    let tenantSlug: string | null = null
    if (rawTenantId) {
        const numericId = Number(rawTenantId)
        if (isNaN(numericId)) {
            return res.status(400).json({errors: ['tenantId must be a number']})
        }
        const result = await db.query('SELECT slug FROM tenant WHERE id = $1', [numericId])
        tenantSlug = result.rows[0]?.slug ?? null
        if (!tenantSlug) {
            return res.status(404).json({errors: ['Tenant not found']})
        }
    }

    try {
        await assertUserCanAccessTenant(tenantSlug, req, res)
    } catch (err) {
        console.log(err.stack)
        return res.status(403).json({errors: [err.message]})
    }

    return apiRoute(req, res)
})

/**
 * Wrap an API Route to check that the user is an admin.
 * If they're not logged in the handler will return a 401 Unauthorized.
 * If they're not an admin, then the handler will return a 403 Forbidden.
 *
 * ```js
 * // pages/api/admin-route.js
 * import { withAdminCheck } from 'lib/auth-server';
 *
 * export default withAdminCheck(async (req, res) => {
 *   ...
 * });
 * ```
 *
 * @category Server
 */
export const withAdminCheck = (apiRoute: NextApiHandler) => withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse): Promise<any> => {

    try {
        await assertUserIsAdmin(req, res)
    } catch (err) {
        console.log(err.stack)
        return res.status(403).json({error: err.message})
    }

    return apiRoute(req, res)
})
