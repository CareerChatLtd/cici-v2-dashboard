import {getSession} from "@auth0/nextjs-auth0";

export const namespace = 'https://cicichat.co.uk'

export const getTenantIdForLoggedInUser = user => user[`${namespace}/tenantId`]

// Helper functions for Auth0 API user objects (use app_metadata directly)
export const getTenantIdsForApiUser = apiUser => {
    // Check for tenantIds array first, fallback to single tenantId
    const tenantIds = apiUser.app_metadata?.tenantIds;
    if (tenantIds && Array.isArray(tenantIds)) {
        return tenantIds;
    }
    const singleTenant = apiUser.app_metadata?.tenantId;
    return singleTenant ? [singleTenant] : [];
}

// Helper functions for logged-in user objects (use namespaced properties)
export const getTenantIdsForLoggedInUser = user => {
    // Check for tenantIds array first, fallback to single tenantId
    const tenantIds = user[`${namespace}/tenantIds`];
    if (tenantIds && Array.isArray(tenantIds)) {
        return tenantIds;
    }
    const singleTenant = user[`${namespace}/tenantId`];
    return singleTenant ? [singleTenant] : [];
}

export const getDefaultTenantId = async (req, res) => {
    const {user} = await getSession(req, res);
    const tenantIds = getTenantIdsForLoggedInUser(user);
    return tenantIds.length > 0 ? tenantIds[0] : getTenantIdForLoggedInUser(user);
}

export const assertUserCanAccessTenant = async (tenantId, req, res) => {
    const {user} = await getSession(req, res);
    const userTenantIds = getTenantIdsForLoggedInUser(user);

    if (userTenantIds.includes('cici')) {
        // Shortcut for CareerChat users (admins)
        return;
    }
    if (tenantId === '' || tenantId === null || tenantId === undefined) {
        throw new Error(`User '${user.email}' cannot access all tenants`)
    }
    if (!userTenantIds.includes(tenantId)) {
        throw new Error(`User '${user.email}' cannot access tenant '${tenantId}'`)
    }
}

export const isUserAdmin = user => {
    const userTenantIds = getTenantIdsForLoggedInUser(user);
    return userTenantIds.includes('cici');
}

export const isMultiTenantUser = user => {
    const userTenantIds = getTenantIdsForLoggedInUser(user);
    return userTenantIds.length > 1;
}

export const assertUserIsAdmin = async (req, res) => {
    const {user} = await getSession(req, res);

    if (!isUserAdmin(user)) {
        throw new Error(`User '${user.email}' is not an Admin`)
    }
}

export const getAccessToken = async () => {
    const {
        AUTH0_BACKEND_CLIENT_ID: clientId,
        AUTH0_BACKEND_CLIENT_SECRET: clientSecret,
        AUTH0_ISSUER_BASE_URL: baseUrl,
    } = process.env

    const {access_token: accessToken} = await (await fetch(
        `${baseUrl}/oauth/token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
                audience: `${baseUrl}/api/v2/`
            }),
        })).json()

    return accessToken;
}