import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";
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
        WITH filtered_users(id) AS MATERIALIZED (${getFilteredUsersCte(req, true)})
        SELECT ur.id,
               "responseBoolean",
               "responseText",
               qo.text AS "selectedOptionText",
               ur."respondedAt"
        FROM user_responses AS ur
                 JOIN filtered_users AS fu
                      ON ur."userId"::uuid = fu.id
                 LEFT JOIN user_response_options AS uro ON ur.id = uro."responseId"
                 LEFT JOIN question_options AS qo
                           ON (ur."selectedOptionId" = qo."id" OR uro."optionId" = qo."id")
        WHERE ur."questionId" = $1
          AND ur."respondedAt" >= $2
          AND ur."respondedAt" < $3
        ORDER BY ur."respondedAt"`

    const result = await db.query(sql, [questionId, start, adjustedEnd])
    const data = result.rows
    return res.status(200).json({data})
})
