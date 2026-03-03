import {withAdminCheck} from "@/lib/auth-server";
import {getAccessToken, getTenantSlugsForApiUser} from "@/lib/auth0";
import {getQueryParam} from "@/lib/apiUtils";
import {db} from "@/lib/database";

export default withAdminCheck(async (req, res) => {

    const id = getQueryParam(req, 'id') ?? ''
    const rawTenantId = getQueryParam(req, 'tenantId') ?? ''
    if (id === '') {
        return res.status(400).json({
            error: `Query param "id" is required for this endpoint`
        })
    }
    if (rawTenantId === '') {
        return res.status(400).json({
            error: `Query param "tenantId" is required for this endpoint`
        })
    }
    const {
        AUTH0_ISSUER_BASE_URL: authZeroBaseUrl,
    } = process.env

    // Remove tenant from user or delete user entirely
    try {
        // Resolve numeric tenant ID to slug for Auth0 metadata
        const tenantResult = await db.query('SELECT slug FROM tenant WHERE id = $1', [rawTenantId])
        const tenantSlug = tenantResult.rows[0]?.slug
        if (!tenantSlug) {
            return res.status(404).json({error: 'Tenant not found'})
        }

        const accessToken = await getAccessToken();

        // First, get the current user data
        const getUserUrl = `${authZeroBaseUrl}/api/v2/users/${id}`;
        const userResponse = await fetch(getUserUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            return res.status(userResponse.status).json({error: errorData.message});
        }

        const user = await userResponse.json();
        const currentTenantSlugs = getTenantSlugsForApiUser(user);

        if (!currentTenantSlugs.includes(tenantSlug)) {
            return res.status(400).json({
                error: `User is not a member of tenant '${tenantSlug}'`
            });
        }

        // Remove the tenant from the user's tenantSlugs array
        const updatedTenantSlugs = currentTenantSlugs.filter(s => s !== tenantSlug);

        if (updatedTenantSlugs.length === 0) {
            // User has no more tenants - delete them entirely
            const deleteUrl = `${authZeroBaseUrl}/api/v2/users/${id}`;
            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (deleteResponse.ok) {
                return res.status(200).json({message: `User successfully deleted`});
            } else {
                const errorData = await deleteResponse.json();
                return res.status(deleteResponse.status).json({error: errorData.message});
            }
        } else {
            // User still has other tenants - just update their tenantSlugs array
            const patchUrl = `${authZeroBaseUrl}/api/v2/users/${id}`;
            const patchResponse = await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_metadata: {
                        ...user.app_metadata,
                        tenantIds: updatedTenantSlugs,
                    }
                })
            });

            if (patchResponse.ok) {
                return res.status(200).json({message: `User successfully removed from tenant`});
            } else {
                const errorData = await patchResponse.json();
                return res.status(patchResponse.status).json({error: errorData.message});
            }
        }
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
