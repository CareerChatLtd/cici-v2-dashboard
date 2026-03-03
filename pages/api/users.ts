import {withAdminCheck} from "@/lib/auth-server";
import {getAccessToken} from "@/lib/auth0";
import {db} from "@/lib/database";

export default withAdminCheck(async (req, res) => {

    const {tenantId: rawTenantId = null} = req.query

    const {
        AUTH0_ISSUER_BASE_URL: baseUrl,
    } = process.env

    // Resolve numeric tenant ID to slug for Auth0 query
    let tenantSlug = ''
    if (rawTenantId) {
        const tenantResult = await db.query('SELECT slug FROM tenant WHERE id = $1', [rawTenantId])
        tenantSlug = tenantResult.rows[0]?.slug ?? ''
    }

    const accessToken = await getAccessToken()
    let query = '';
    if (tenantSlug) {
        // Search for users who have the tenant slug in either the single tenantId field or the tenantIds array
        query = `(app_metadata.tenantId:"${tenantSlug}" OR app_metadata.tenantIds:"${tenantSlug}")`;
    }
    
    const queryString = new URLSearchParams({
        q: query,
        sort: `name:1`,
    })
    const url = `${baseUrl}/api/v2/users?${queryString}`
    const users = await (await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })).json()

    return res.status(200).json({data: users});
})
