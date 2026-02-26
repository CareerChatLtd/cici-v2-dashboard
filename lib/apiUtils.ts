import {AgeBracket} from "@/lib/ages";
import qs from "qs";
import {NextApiRequest} from "next";

export const makeApiRequestForDateRange = (
    tenantId: string,
    endpoint: string,
    [start, end]: [Date, Date],
    ageBracket: AgeBracket | null = null,
    additionalParams = {}
) => {
    const {minAge = 0, maxAge = 999} = ageBracket || {}
    const params = {
        start: start.toISOString().substring(0, 10),
        end: end.toISOString().substring(0, 10),
        minAge: String(minAge),
        maxAge: String(maxAge),
        ...additionalParams
    }

    return makeApiRequestForTenant(tenantId, endpoint, params)
}

export const makeApiRequestForTenant = (tenantId: string, endpoint: string, additionalParams = {}) => {
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

/**
 * Next.js doesn't support objects in query parameters, so we need to parse the query string ourselves.
 */
export const getDeepQuery = (req: NextApiRequest) => {
    const queryString = req.url?.split('?')[1] || '';

    return qs.parse(queryString);
};
