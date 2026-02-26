import {withAdminCheck} from "@/lib/auth";
import {getAccessToken, getTenantIdsForApiUser} from "@/lib/auth0";

export default withAdminCheck(async (req, res) => {

    const {id = '', tenantId = ''} = req.query
    if (id === '') {
        return res.status(400).json({
            error: `Query param "id" is required for this endpoint`
        })
    }
    if (tenantId === '') {
        return res.status(400).json({
            error: `Query param "tenantId" is required for this endpoint`
        })
    }
    const {
        AUTH0_ISSUER_BASE_URL: baseUrl,
    } = process.env

    // Remove tenant from user or delete user entirely
    try {
        const accessToken = await getAccessToken();
        
        // First, get the current user data
        const getUserUrl = `${baseUrl}/api/v2/users/${id}`;
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
        const currentTenantIds = getTenantIdsForApiUser(user);

        if (!currentTenantIds.includes(tenantId)) {
            return res.status(400).json({
                error: `User is not a member of tenant '${tenantId}'`
            });
        }

        // Remove the tenant from the user's tenantIds array
        const updatedTenantIds = currentTenantIds.filter(id => id !== tenantId);

        if (updatedTenantIds.length === 0) {
            // User has no more tenants - delete them entirely
            const deleteUrl = `${baseUrl}/api/v2/users/${id}`;
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
            // User still has other tenants - just update their tenantIds array
            const patchUrl = `${baseUrl}/api/v2/users/${id}`;
            const patchResponse = await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    app_metadata: {
                        ...user.app_metadata,
                        tenantIds: updatedTenantIds,
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
