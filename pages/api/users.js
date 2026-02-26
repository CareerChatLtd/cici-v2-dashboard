import {withAdminCheck} from "@/lib/auth";
import {getAccessToken} from "@/lib/auth0";

export default withAdminCheck(async (req, res) => {

    const {tenantId = null} = req.query

    const {
        AUTH0_ISSUER_BASE_URL: baseUrl,
    } = process.env

    const accessToken = await getAccessToken()
    let query = '';
    if (tenantId) {
        // Search for users who have the tenantId in either the single tenantId field or the tenantIds array
        query = `(app_metadata.tenantId:"${tenantId}" OR app_metadata.tenantIds:"${tenantId}")`;
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
