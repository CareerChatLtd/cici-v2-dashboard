import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";

export default withTenantCheck(async (req, res) => {

    const {start: rawStart, end: rawEnd, tenantId} = req.query

    const start = String(rawStart)
    const end = String(rawEnd)

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const adjustedEnd = addDayToDateString(end)

        // Get counts by risk tier and total (counting unique users, classified by highest tier)
        const tierSql = `
            WITH user_highest_tier AS (
                SELECT
                    "userId",
                    CASE
                        WHEN BOOL_OR("riskTier" = 'HIGH') THEN 'HIGH'
                        WHEN BOOL_OR("riskTier" = 'LOW')  THEN 'LOW'
                        ELSE NULL
                    END as highest_tier
                FROM cici.user_messages
                WHERE "tenantId" = $1
                  AND "sentAt" >= $2
                  AND "sentAt" < $3
                GROUP BY "userId"
            )
            SELECT
                COUNT(*)::integer AS total_count,
                COUNT(*) FILTER (WHERE highest_tier = 'HIGH')::integer AS high_count,
                COUNT(*) FILTER (WHERE highest_tier = 'LOW')::integer AS low_count
            FROM user_highest_tier
        `

        const tierResult = await db.query(tierSql, [tenantId, start, adjustedEnd])

        // Get breakdown by risk category (counting messages)
        const categorySql = `
            SELECT
                "riskTier",
                "riskCategory",
                   COUNT(*)::integer AS "count"
            FROM cici.user_messages
            WHERE "tenantId" = $1
              AND "sentAt" >= $2
              AND "sentAt" < $3
              AND "riskTier" IS NOT NULL
              AND "riskTier" != 'NONE'
              AND "riskCategory" IS NOT NULL
              AND "riskCategory" != 'NONE'
            GROUP BY "riskTier", "riskCategory"
            ORDER BY "count" DESC
        `

        const categoryResult = await db.query(categorySql, [tenantId, start, adjustedEnd])

        // Extract tier and total counts
        const counts = tierResult.rows[0] || {total_count: 0, high_count: 0, low_count: 0}

        const data = {
            highCount: counts.high_count || 0,
            lowCount: counts.low_count || 0,
            totalCount: counts.total_count || 0,
            categories: categoryResult.rows.map(row => ({
                tier: row.riskTier,
                name: row.riskCategory,
                count: row.count
            }))
        }

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
