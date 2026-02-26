import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async (req, res) => {
    const result = await db.query(`SELECT unnest(enum_range(NULL::question))::varchar AS question ORDER BY question ASC`)
    const data = result.rows.map(row => ({
        id: row.question,
        name: row.question.replace(/_/g, ' ').replace(/^./g, x => x.toUpperCase()),
    }))
    return res.status(200).json({data})
})