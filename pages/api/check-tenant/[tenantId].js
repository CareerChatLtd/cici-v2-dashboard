import {db} from "@/lib/database";

export default async function handler(req, res) {

    const {tenantId = 'XXX'} = req.query

    const sql = `SELECT EXISTS(SELECT 1
                               FROM cici.tenants
                               WHERE id = $1) AS "valid"`

    const [{valid}] = (await db.query(sql, [tenantId])).rows;

    return res.status(200).json({valid});
}
