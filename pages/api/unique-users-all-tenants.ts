import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth-server";
import type {NextApiRequest, NextApiResponse} from "next";

const countsSql = `
    select count(distinct u."id")::INT                  as "totalUsers",
           count(distinct case
                              when date_trunc('day', u."createdAt") BETWEEN $1 AND $2
                                  then u."id" end)::INT as "newUsers",
           count(distinct case
                              when date_trunc('day', u."createdAt") NOT BETWEEN $1 AND $2
                                  then u."id" end)::INT as "existingUsers"
    from message as m
             join "user" as u on u."id" = m."userId"
    where date_trunc('day', m."createdAt") BETWEEN $1 AND $2
    ;
`

const getCounts = async (start: string, end: string) => {
    const results = await db.query(countsSql, [start, end])

    return results.rows[0]
}

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const {start, end} = req.query as {start: string; end: string}

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const data = await getCounts(start, end)

        return res.status(200).json(data)
    } catch (err) {
        console.log((err as Error).stack)
        return res.status(500).json({error: (err as Error).message})
    }
})
