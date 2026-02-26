import {addMonth, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withAdminCheck} from "@/lib/auth";

const sql = `
    SELECT TO_CHAR(DATE_TRUNC('month', c."monthStart"), 'YYYY-MM') AS month,
           COUNT(DISTINCT m.id)::INT AS "totalMessages"
    FROM calendar_month AS c
             LEFT JOIN
         msg_messages AS m
         ON
             DATE_TRUNC('month', m."sentOn") = c."monthStart"
                 AND m."authorId" IS NOT NULL
                 AND m.payload ->> 'type' IN ('text', 'quick_reply', 'session_reset', 'postback')
    WHERE c."monthStart" >= $1
      AND c."monthStart" < $2
    GROUP BY c."monthStart"
    ORDER BY c."monthStart";
`

export default withAdminCheck(async (req, res) => {

    const {month, months = "1"} = req.query

    const {valid, error} = validateMonthString(month);
    if (!valid) {
        return res.status(400).json({error: 'month: ' + error})
    }

    const monthCount = parseInt(months)

    if (monthCount > 12) {
        return res.status(400).json({error: 'months: Parameter must be no more than 12'})
    }

    const endMonth = addMonth(month, monthCount)

    const start = `${month}-01`
    const end = `${endMonth}-01`

    try {
        const result = await db.query(sql, [start, end])

        const data = result.rows;

        return res.status(200).json(data)
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
