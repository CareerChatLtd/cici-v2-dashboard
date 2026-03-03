import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth-server";
import {Question, QuestionOption} from "@/lib/types";

export default withTenantCheck(async (req, res) => {
    const {tenantId} = req.query

    const {rows: data} = await db.query<Question>(`SELECT q.*
                                                    FROM question AS q
                                                    WHERE q."tenantId" = $1
                                                    ORDER BY q.name`, [tenantId])

    const questionIds = data.map(q => q.id)

    const optionsResults = await db.query<QuestionOption>(`SELECT *
                                                           FROM "questionOption"
                                                           WHERE "questionId" = ANY ($1::bigint[])
                                                           ORDER BY id`, [questionIds])
    data.forEach(question => {
        question.options = optionsResults.rows.filter(o => o.questionId === question.id)
    })

    return res.status(200).json({data})
})
