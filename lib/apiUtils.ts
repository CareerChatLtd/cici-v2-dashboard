import qs from "qs";
import {NextApiRequest} from "next";

export const makeApiRequestForDateRange = (
    tenantId: number,
    endpoint: string,
    [start, end]: [Date, Date],
    additionalParams = {}
) => {
    const params = {
        start: start.toISOString().substring(0, 10),
        end: end.toISOString().substring(0, 10),
        ...additionalParams
    }

    return makeApiRequestForTenant(tenantId, endpoint, params)
}

export const makeApiRequestForTenant = (tenantId: number, endpoint: string, additionalParams = {}) => {
    const params = qs.stringify({
        tenantId: tenantId ? String(tenantId) : '',
        ...additionalParams
    }, {encodeValuesOnly: true})
    return fetch(`/api/${endpoint}?${params}`)
        .then((res) => {
            if (!res.ok) {
                const errorMessage = `Failed to fetch ${endpoint} for tenant "${tenantId}" with status code ${res.status}`
                throw new Error(errorMessage)
            }
            return (res.status !== 204) ? res.json() : res
        })
        .then(({data}) => data)
}

export const getQueryParam = (req: NextApiRequest, key: string): string | null => {
    const val = req.query[key]
    if (Array.isArray(val)) return val[0] ?? null
    return val ?? null
};

/**
 * Next.js doesn't support objects in query parameters, so we need to parse the query string ourselves.
 */
export const getDeepQuery = (req: NextApiRequest) => {
    const queryString = req.url?.split('?')[1] || '';

    return qs.parse(queryString);
};
