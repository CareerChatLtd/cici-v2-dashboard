import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";

export default withTenantCheck(async (req, res) => {

    const {tenantId, id} = req.query

    const questionResult = await db.query(`SELECT q.*
                                              FROM cici.questions AS q
                                                       JOIN cici.question_types AS qt ON qt.id = q."typeId"
                                              WHERE q.id = $1
                                                AND q."tenantId" = $2
                                              LIMIT 1`, [id, tenantId])

    if (questionResult.rows.length === 0) {
        return res.status(404).json({error: `Question not found`})
    }

    const question = questionResult.rows[0]

    const optionsResults = await db.query(`SELECT *
                                              FROM cici.question_options
                                              WHERE "questionId" = $1
                                              ORDER BY id`, [question.id])
    question.options = optionsResults.rows

    const topicResults = await db.query(`SELECT *
                                              FROM cici.question_topics
                                              WHERE "questionId" = $1
                                              ORDER BY id`, [question.id])
    question.topics = topicResults.rows.map(({topicId}) => topicId)


    return res.status(200).json({data: question})
})
