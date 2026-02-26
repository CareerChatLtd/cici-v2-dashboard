import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";
import {Question, QuestionOption} from "@/lib/types";

type QuestionWithType = Question & { type: string };

export default withTenantCheck(async (req, res) => {
    const {tenantId} = req.query
    const {rows: data} = await db.query<QuestionWithType>(`SELECT q.*, qt.name AS type
                                                           FROM cici.questions AS q
                                                                    JOIN cici.question_types AS qt ON qt.id = q."typeId"
                                                           WHERE q."tenantId" = $1
                                                           ORDER BY q.name`, [tenantId])

    const questionIds = data.map(q => q.id)

    const optionsResults = await db.query<QuestionOption>(`SELECT *
                                                           FROM cici.question_options
                                                           WHERE "questionId" = ANY ($1::int[])
                                                           ORDER BY id`, [questionIds])
    data.forEach(question => {
        question.options = optionsResults.rows.filter(o => o.questionId === question.id)
    })

    return res.status(200).json({data})
})
