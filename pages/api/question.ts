import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth-server";

export default withTenantCheck(async (req, res) => {

    const {tenantId, id} = req.query

    const questionResult = await db.query(`SELECT q.*
                                              FROM question AS q
                                              WHERE q.id = $1
                                                AND q."tenantId" = $2
                                              LIMIT 1`, [id, tenantId])

    if (questionResult.rows.length === 0) {
        return res.status(404).json({error: `Question not found`})
    }

    const question = questionResult.rows[0]

    const optionsResults = await db.query(`SELECT *
                                              FROM "questionOption"
                                              WHERE "questionId" = $1
                                              ORDER BY id`, [question.id])
    question.options = optionsResults.rows

    return res.status(200).json({data: question})
})
