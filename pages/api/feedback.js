import {validateDateRangeStrings, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import {assertUserCanAccessTenant} from "@/lib/auth0";

const getFeedback = (start, end, tenantId = '') => {
    let sql = `
        SELECT "text" AS "message", "rating"
        FROM cici.feedback
        WHERE "createdAt" >= $1
          AND "createdAt" < $2
    `
    if (tenantId.length) {
        sql = sql + ` AND "tenantId" = $3`
    } else {
        sql = sql + ` AND '' = $3`
    }

    return db.query(sql, [start, end, tenantId])
}

const getRatings = (start, end, tenantId = '') => {
    let sql = `
        SELECT AVG("rating") AS "average",
               COUNT(1)      AS "count"
        FROM cici.feedback
        WHERE "createdAt" >= $1
          AND "createdAt" < $2
    `
    if (tenantId.length) {
        sql = sql + ` AND "tenantId" = $3`
    } else {
        sql = sql + ` AND '' = $3`
    }

    return db.query(sql, [start, end, tenantId])
}

export default withApiAuthRequired(async (req, res) => {

    const {month, format = 'json', tenantId = '', start: startOn, end: endOn} = req.query

    let start, end;

    if (month) {
        const {valid, error} = validateMonthString(month);
        if (!valid) {
            return res.status(400).json({error: 'month: ' + error})
        }
        const [y, m] = month.split('-').map(v => parseInt(v))
        start = `${y}-${m}-01`
        const endMonth = m >= 12 ? `01` : `${m + 1}`.padStart(2, '0')
        const endYear = m >= 12 ? y + 1 : y
        end = `${endYear}-${endMonth}-01`
    } else {
        const {valid, error} = validateDateRangeStrings(startOn, endOn)
        if (!valid) {
            return res.status(400).json({error})
        }
        start = startOn
        end = endOn
    }

    try {
        await assertUserCanAccessTenant(tenantId, req, res)

        const [{average, count}] = (await getRatings(start, end, tenantId)).rows
        const messages = (await getFeedback(start, end, tenantId)).rows

        const data = {
            averageScore: parseFloat(parseFloat(average).toFixed(2)),
            numberOfRatings: parseInt(count),
            responses: messages.map(({message, rating}) => ({
                message: message.trim(),
                rating: parseInt(rating),
            }))
        }

        if (format === 'json') {
            return res.status(200).json({data});
        } else if (format === 'tsv') {
            return res.status(400).json({error: 'Only JSON format currently supported'})
            // const header = ['Average Score', 'Number of Ratings', 'New Users', 'Existing Users', 'Total Users'].join("\t");
            // const rows = data.map(o => Object.values(o).join("\t"))
            // return res.status(200)
            //     .setHeader('Content-Type', 'text/tab-separated-values')
            //     .send(header + "\n" + rows.join("\n"))
        } else {
            return res.status(400).json({error: 'This format not supported. Choose from "json" or "tsv".'})
        }
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
