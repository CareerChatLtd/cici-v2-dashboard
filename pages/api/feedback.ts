import {addDayToDateString, validateDateRangeStrings, validateMonthString} from "@/lib/dateUtils";
import {db} from "@/lib/database";
import {withTenantCheck} from "@/lib/auth-server";

type Vote = 'up' | 'down';

interface MessageVote {
    vote: Vote;
    messageId: number;
    reason: string;
    details: string;
}

interface GeneralFeedback {
    id: number;
    userId: string;
    text: string;
    createdAt: string;
}

export interface FeedbackResponse {
    upCount: number;
    downCount: number;
    numberOfRatings: number;
    responses: MessageVote[];
    generalFeedback: GeneralFeedback[];
}

const getFeedback = (start, end, tenantId: number | null = null) => {
    let sql = `
        SELECT mv."vote", mv."messageId", mv."reason", mv."details"
        FROM "messageVote" AS mv
        WHERE mv."createdAt" >= $1
          AND mv."createdAt" < $2
    `
    const params: unknown[] = [start, end]
    if (tenantId) {
        sql += ` AND mv."tenantId" = $3`
        params.push(tenantId)
    }
    return db.query(sql, params);
}

const getRatings = (start, end, tenantId: number | null = null) => {
    let sql = `
        SELECT COUNT(1) FILTER (WHERE mv."vote" = 'up')   AS "upCount",
               COUNT(1) FILTER (WHERE mv."vote" = 'down') AS "downCount",
               COUNT(1)                                   AS "count"
        FROM "messageVote" AS mv
        WHERE mv."createdAt" >= $1
          AND mv."createdAt" < $2
    `
    const params: unknown[] = [start, end]
    if (tenantId) {
        sql += ` AND mv."tenantId" = $3`
        params.push(tenantId)
    }
    return db.query(sql, params)
}

const getGeneralFeedback = (start, end, tenantId: number | null = null) => {
    let sql = `
        SELECT f."id", f."userId", f."text", f."createdAt"
        FROM "feedback" AS f
        WHERE f."createdAt" >= $1
          AND f."createdAt" < $2
    `
    const params: unknown[] = [start, end]
    if (tenantId) {
        sql += ` AND f."tenantId" = $3`
        params.push(tenantId)
    }
    sql += ` ORDER BY f."createdAt" DESC`
    return db.query(sql, params)
}

export default withTenantCheck(async (req, res) => {

    const {month: rawMonth, format = 'json', tenantId: rawTenantId = '', start: startOn, end: endOn} = req.query

    const month = rawMonth ? String(rawMonth) : ''
    const tenantId = rawTenantId ? Number(rawTenantId) : null

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
        end = addDayToDateString(String(endOn))
    }

    try {
        const [{upCount, downCount, count}] = (await getRatings(start, end, tenantId)).rows
        const messages = (await getFeedback(start, end, tenantId)).rows as MessageVote[]
        const general = (await getGeneralFeedback(start, end, tenantId)).rows as GeneralFeedback[]

        const data: FeedbackResponse = {
            upCount: parseInt(upCount),
            downCount: parseInt(downCount),
            numberOfRatings: parseInt(count),
            responses: messages.map(({vote, messageId, reason, details}) => ({
                vote,
                messageId,
                reason: reason?.trim() ?? null,
                details: details?.trim() ?? null,
            })),
            generalFeedback: general.map(({id, userId, text, createdAt}) => ({
                id,
                userId,
                text: text?.trim() ?? null,
                createdAt,
            }))
        }

        if (format === 'json') {
            return res.status(200).json({data});
        } else if (format === 'tsv') {
            return res.status(400).json({error: 'Only JSON format currently supported'})
        } else {
            return res.status(400).json({error: 'This format not supported. Choose from "json" or "tsv".'})
        }
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
