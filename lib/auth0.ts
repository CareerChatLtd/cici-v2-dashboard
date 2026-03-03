import {getSession} from "@auth0/nextjs-auth0";
import type {NextApiRequest, NextApiResponse} from "next";

export const namespace = 'https://cicichat.co.uk'

export interface Auth0User {
    email?: string;
    [key: string]: unknown;
}

interface Auth0ApiUser {
    app_metadata?: {
        tenantIds?: string[];
        tenantId?: string;
    };
    [key: string]: unknown;
}

// Yes, confusingly, in Auth0 we called the tenant identifier 'tenantId', but it's actually the tenant's slug that we use
export const getTenantSlugForLoggedInUser = (user: Auth0User): string | undefined =>
    user[`${namespace}/tenantId`] as string | undefined

// Helper functions for Auth0 API user objects (use app_metadata directly)
export const getTenantSlugsForApiUser = (apiUser: Auth0ApiUser): string[] => {
    // Check for tenantIds array first, fallback to single tenantId
    const slugs = apiUser.app_metadata?.tenantIds;
    if (slugs && Array.isArray(slugs)) {
        return slugs;
    }
    const slug = apiUser.app_metadata?.tenantId;
    return slug ? [slug] : [];
}

// Helper functions for logged-in user objects (use namespaced properties)
export const getTenantSlugsForLoggedInUser = (user: Auth0User): string[] => {
    // Check for tenantIds array first, fallback to single tenantId
    const tenantIds = user[`${namespace}/tenantIds`];
    if (tenantIds && Array.isArray(tenantIds)) {
        return tenantIds;
    }
    const singleTenant = user[`${namespace}/tenantId`] as string | undefined;
    return singleTenant ? [singleTenant] : [];
}

export const getUsersTenantSlug = async (req: NextApiRequest, res: NextApiResponse): Promise<string | undefined> => {
    const session = await getSession(req, res);
    const user = session?.user as Auth0User;
    const tenantIds = getTenantSlugsForLoggedInUser(user);
    return tenantIds.length > 0 ? tenantIds[0] : getTenantSlugForLoggedInUser(user);
}

export const assertUserCanAccessTenant = async (tenantSlug: string | null | undefined, req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const session = await getSession(req, res);
    const user = session?.user as Auth0User;
    const userTenantSlugs = getTenantSlugsForLoggedInUser(user);

    if (userTenantSlugs.includes('cici')) {
        // Shortcut for CareerChat users (admins)
        return;
    }
    if (tenantSlug === '' || tenantSlug === null || tenantSlug === undefined) {
        throw new Error(`User '${user.email}' cannot access all tenants`)
    }
    if (!userTenantSlugs.includes(tenantSlug)) {
        throw new Error(`User '${user.email}' cannot access tenant '${tenantSlug}'`)
    }
}

export const isUserAdmin = (user: Auth0User): boolean => {
    const userTenantSlugs = getTenantSlugsForLoggedInUser(user);
    return userTenantSlugs.includes('cici');
}

export const isMultiTenantUser = (user: Auth0User): boolean => {
    const userTenantSlugs = getTenantSlugsForLoggedInUser(user);
    return userTenantSlugs.length > 1;
}

export const assertUserIsAdmin = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const session = await getSession(req, res);
    const user = session?.user as Auth0User;

    if (!isUserAdmin(user)) {
        throw new Error(`User '${user?.email}' is not an Admin`)
    }
}

export const getAccessToken = async (): Promise<string> => {
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
