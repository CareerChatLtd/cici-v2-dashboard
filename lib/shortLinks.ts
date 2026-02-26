export const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL
const shortLinkBaseUrl = 'http://cicichat.uk'

const isDev = process.env.NODE_ENV === 'development'

export const getShortLinkForId = (id: string) => {
    return isDev ? `${appBaseUrl}?tenantId=${id}` : `${shortLinkBaseUrl}/bot/${id}`
}

// We don't have an equivalent handler for short IDs, so we just use the production one for this
export const getShortLinkForShortId = (shortId: string) => `${shortLinkBaseUrl}/${shortId}`