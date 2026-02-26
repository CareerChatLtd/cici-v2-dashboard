import {db} from "@/lib/database";
import {addDayToDateString, validateDateRangeStrings} from "@/lib/dateUtils";
import {getFilteredUsersCte} from "@/lib/userFilterQueries";
import {withTenantCheck} from "@/lib/auth";
import {BuiltInQuestion, BuiltInQuestionReportData, validQuestions} from "@/lib/builtInQuestionReports";

const isValidQuestion = (question: string): question is BuiltInQuestion => {
    return validQuestions.includes(question as BuiltInQuestion)
}

export default withTenantCheck(async (req, res) => {

    const {start: rawStart, end: rawEnd, question: rawQuestion} = req.query

    if (!rawQuestion) {
        return res.status(400).json({error: 'No question specified'})
    }
    const question = String(rawQuestion).trim()
    if (!isValidQuestion(question)) {
        return res.status(400).json({error: `Invalid question: ${question}`})
    }

    const start = String(rawStart)
    const end = String(rawEnd)

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const adjustedEnd = addDayToDateString(end)

        const sql = `
            WITH filtered_users(id, created_at, updated_at, attributes) AS MATERIALIZED (${getFilteredUsersCte(req)})
            SELECT (fu.attributes ->> $1)::text AS "name",
                   COUNT(DISTINCT fu.id)::integer AS "count"
            FROM filtered_users AS fu
            JOIN msg_messages_relevant m ON m."authorId" = fu.id
            WHERE m."sentOn" >= $2
              AND m."sentOn" < $3
            GROUP BY (fu.attributes ->> $1):: text
            ORDER BY count DESC
        `

        const result = await db.query(sql, [question, start, adjustedEnd])
        const rows: Array<{ name: string, count: number }> = result.rows
        const total = rows.reduce((total, row) => total + row.count, 0)

        const data: BuiltInQuestionReportData = rows.map(({name, count}) => {
            const percent = Math.round(((count / total) * 100) * 100) / 100
            return {name, count, percent}
        })

        return res.status(200).json({data})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
