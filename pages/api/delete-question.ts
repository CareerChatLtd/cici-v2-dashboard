import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth";

export default withTenantCheck(async (req, res) => {

    const {id = '', tenantId} = req.query
    if (id === '') {
        return res.status(400).json({
            error: `Query param "id" is required for this endpoint`
        })
    }

    try {
        await db.query(
            `DELETE
             FROM cici.questions
             WHERE id = $1
               AND "tenantId" = $2`,
            [id, tenantId]
        )
        return res.status(204).send('')
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
