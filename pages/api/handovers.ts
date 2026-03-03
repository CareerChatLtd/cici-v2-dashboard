import {db} from "@/lib/database";
import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {withTenantCheck} from "@/lib/auth-server";
import {getQueryParam} from "@/lib/apiUtils";

const sql = `
    WITH hc AS (
        SELECT h."createdAt"::date AS date, count(*)::int AS ct
        FROM handover h
        WHERE h."createdAt" >= $1 AND h."createdAt" < $2
        AND h."tenantId" = $3
        GROUP BY 1
    )
    SELECT c.date, COALESCE(hc.ct, 0) AS count
    FROM "calendarDay" c
    LEFT JOIN hc ON hc.date = c.date
    WHERE c.date BETWEEN $1 AND $4
    ORDER BY c.date
`

export default withTenantCheck(async (req, res) => {

    const tenantId = getQueryParam(req, 'tenantId')
    const start = getQueryParam(req, 'start')
    const end = getQueryParam(req, 'end')

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const adjustedEnd = addDayToDateString(end)
        const {rows: data} = await db.query(sql, [start, adjustedEnd, tenantId, end])

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
