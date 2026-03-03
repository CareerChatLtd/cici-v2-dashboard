export const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL

const shortLinkBaseUrl = 'http://cicichat.uk'

export const getBotUrl = (tenantSlug: string) => {
    return `${appBaseUrl}?t=${tenantSlug}`
}

// We don't have an equivalent handler for short IDs, so we just use the production one for this
export const getBotShortUrl = (shortSlug: string) => `${shortLinkBaseUrl}/${shortSlug}`