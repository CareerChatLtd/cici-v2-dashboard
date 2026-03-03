import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth-server";
import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";

export default withTenantCheck(async (req, res) => {
    const {questionId, start: rawStart, end: rawEnd} = req.query

    const start = String(rawStart)
    const end = String(rawEnd)

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    const adjustedEnd = addDayToDateString(end)

    const sql = `
        WITH filtered_users(id) AS MATERIALIZED (${getFilteredUsersCte(req)})
        SELECT a.id,
               "booleanValue",
               "textValue",
               qo.text AS "selectedOptionText",
               a."respondedAt"
        FROM answer AS a
                 JOIN filtered_users AS fu
                      ON a."userId" = fu.id
                 LEFT JOIN "answerOption" AS ao ON a.id = ao."answerId"
                 LEFT JOIN "questionOption" AS qo
                           ON (a."questionOptionId" = qo."id" OR ao."questionOptionId" = qo."id")
        WHERE a."questionId" = $1
          AND a."respondedAt" >= $2
          AND a."respondedAt" < $3
        ORDER BY a."respondedAt"`

    const result = await db.query(sql, [questionId, start, adjustedEnd])
    const data = result.rows
    return res.status(200).json({data})
})
