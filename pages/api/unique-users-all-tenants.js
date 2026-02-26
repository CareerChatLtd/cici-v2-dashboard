import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth";

const countsSql = `
    select count(distinct u.user_id)::INT                  as "totalUsers",
           count(distinct case
                              when date_trunc('day', u.created_at) BETWEEN $1 AND $2
                                  then u.user_id end)::INT as "newUsers",
           count(distinct case
                              when date_trunc('day', u.created_at) NOT BETWEEN $1 AND $2
                                  then u.user_id end)::INT as "existingUsers"
    from msg_messages as m
             join srv_channel_users as u on u.user_id::uuid = m."authorId"
    where m."authorId" is not null
      and date_trunc('day', m."sentOn") BETWEEN $1 AND $2
      and m.payload->> 'type' IN ('text', 'quick_reply', 'session_reset', 'postback')
    ;
`

const getCounts = async (start, end) => {
    const results = await db.query(countsSql, [start, end])

    return results.rows[0]
}

export default withAdminCheck(async (req, res) => {

    const {start, end} = req.query

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const data = await getCounts(start, end)

        return res.status(200).json(data)
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
