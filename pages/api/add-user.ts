import {withAdminCheck} from "@/lib/auth-server";
import {getAccessToken, getTenantSlugsForApiUser} from "@/lib/auth0";
import {getQueryParam} from "@/lib/apiUtils";
import {db} from "@/lib/database";

export default withAdminCheck(async (req, res) => {

    const rawTenantId = getQueryParam(req, 'tenantId') ?? ''
    const rawData = JSON.parse(req.body)
    const {
        AUTH0_ISSUER_BASE_URL: baseUrl,
    } = process.env

    // Trim all strings
    const trimmedData: Record<string, unknown> = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string')
            ? v.trim()
            : v
    })

    // Send data to auth0
    try {
        if (rawTenantId === '') {
            return res.status(400).json({
                error: `Query param "tenantId" is required for this endpoint`
            })
        }

        // Resolve numeric tenant ID to slug for Auth0 metadata
        const tenantResult = await db.query('SELECT slug FROM tenant WHERE id = $1', [rawTenantId])
        const tenantSlug = tenantResult.rows[0]?.slug
        if (!tenantSlug) {
            return res.status(404).json({error: 'Tenant not found'})
        }

        const accessToken = await getAccessToken();
        const {email, password} = trimmedData;

        // First, check if user already exists
        const searchUrl = `${baseUrl}/api/v2/users?q=email:"${email}"`;
        const searchResponse = await fetch(searchUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const existingUsers = await searchResponse.json();

        if (existingUsers.length > 0) {
            // User exists - add tenant to their tenantSlugs array
            const existingUser = existingUsers[0];
            const currentTenantSlugs = getTenantSlugsForApiUser(existingUser);

            if (currentTenantSlugs.includes(tenantSlug)) {
                return res.status(400).json({
                    error: `User already exists in tenant '${tenantSlug}'`
                });
            }

            // Add the new tenant to their tenantIds array
            const updatedTenantSlugs = [...currentTenantSlugs, tenantSlug];
            const patchUrl = `${baseUrl}/api/v2/users/${existingUser.user_id}`;
            const patchResponse = await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_metadata: {
                        ...existingUser.app_metadata,
                        tenantIds: updatedTenantSlugs,
                    }
                })
            });

            if (patchResponse.ok) {
                return res.status(200).json({message: 'User successfully added to tenant'});
            } else {
                const errorData = await patchResponse.json();
                return res.status(patchResponse.status).json({error: errorData.message});
            }
        } else {
            // User doesn't exist - create new user with tenantIds array
            const createUrl = `${baseUrl}/api/v2/users`;
            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    app_metadata: {
                        tenantIds: [tenantSlug],
                    },
                    connection: 'Username-Password-Authentication',
                })
            });

            const result = await createResponse.json();
            if (createResponse.ok) {
                return res.status(201).json({message: 'User successfully created'});
            } else {
                return res.status(createResponse.status).json({error: result.message});
            }
        }
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
