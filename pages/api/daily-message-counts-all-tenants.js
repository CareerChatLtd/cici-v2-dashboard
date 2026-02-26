import {validateDateRangeStrings} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth";

const sql = `
    SELECT c.date                    AS date,
           COUNT(DISTINCT m.id)::INT AS "totalMessages"
    FROM calendar_day AS c
             LEFT JOIN
         msg_messages AS m
         ON
             DATE(m."sentOn") = c.date
                 AND m."authorId" IS NOT NULL
                 AND m.payload ->> 'type' IN ('text', 'quick_reply', 'session_reset', 'postback')
    WHERE c.date BETWEEN $1 AND $2
    GROUP BY c.date
    ORDER BY date;
`

export default withAdminCheck(async (req, res) => {

    const {start, end} = req.query

    const {valid, error} = validateDateRangeStrings(start, end)
    if (!valid) {
        return res.status(400).json({error})
    }

    try {
        const result = await db.query(sql, [start, end])

        const data = result.rows;

        return res.status(200).json(data)
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
