import {ParsedQs} from "qs";
import {NextApiRequest} from "next";
import {getDeepQuery} from "@/lib/apiUtils";

const singleChoiceUserSelection = (userId: string, questionId: number, optionId: number) => {
    return `SELECT 1
            FROM cici.user_responses AS ur
            WHERE ur."questionId" = ${questionId}
              AND ur."selectedOptionId" = ${optionId}
              AND ur."userId"::uuid = ${userId}`
}

const multipleChoiceUserSelection = (userId: string, questionId: number, optionId: number) => {
    return `SELECT 1
            FROM cici.user_responses AS ur
                     join cici.user_response_options AS uro on uro."responseId" = ur.id
            WHERE ur."questionId" = ${questionId}
              AND uro."optionId" = ${optionId}
              AND ur."userId"::uuid = ${userId}`
}

const yesNoUserSelection = (userId: string, questionId: number, booleanValue: boolean) => {
    return `SELECT 1
            FROM cici.user_responses AS ur
            WHERE ur."questionId" = ${questionId}
              AND ur."responseBoolean" = ${booleanValue ? 'true' : 'false'}
              AND ur."userId"::uuid = ${userId}`
}

type UserInputValue = string | ParsedQs | (string | ParsedQs)[] | undefined

const buildCustomQuestionsUserFilter = (
    userId: string,
    rawQuestions: UserInputValue,
) => {
    // There might be more efficient ways, but for each question, we'll supply an appropriate query for each
    // possible question type, and then union the results together.

    // questions is an object of type Record<QuestionId, ResponseValue>
    // where QuestionId is a string and ResponseValue is a boolean or OptionId (number)

    // Remove the prefix "_" from the keys in the query string
    const questions = rawQuestions
        ? Object.fromEntries(Object.entries(rawQuestions).map(([k, v]) => [k.replace(/^_/, ''), v]))
        : null

    const queries = []
    if (questions) {
        Object.entries(questions).forEach(([rawQuestionId, responseValue]) => {
            const questionId = Number(rawQuestionId)
            if (isNaN(questionId)) {
                throw new Error(`Invalid question ID: ${rawQuestionId}`)
            }
            if (['true', 'false'].includes(String(responseValue))) {
                queries.push(yesNoUserSelection(userId, questionId, responseValue === 'true'))
            } else if (Array.isArray(responseValue)) {
                // Multiple choice - frontend sends array of length 1 to make it easy to identify as this type of question
                responseValue.forEach(optionId => {
                    const numericOptionId = Number(optionId)
                    if (isNaN(numericOptionId)) {
                        throw new Error(`Invalid option ID: ${optionId}`)
                    }
                    queries.push(multipleChoiceUserSelection(userId, questionId, numericOptionId))
                })
            } else if (responseValue.length) {
                const numericResponseValue = Number(responseValue)
                if (isNaN(numericResponseValue)) {
                    throw new Error(`Invalid response value: ${responseValue}`)
                }
                queries.push(singleChoiceUserSelection(userId, questionId, numericResponseValue))
            }
        })
    }

    return queries.length ? queries.map(q => `\nEXISTS (${q})`).join('\nAND\n') : 'TRUE'
}

/**
 * A reusable CTE that returns a list of user IDs that match known attributes passed in the request.
 * Returns rows with column "id".
 */
export const getFilteredUsersCte = (
    req: NextApiRequest,
    useForeignSchema = false
) => {

    const {tenantId: rawTenantId, minAge: rawMinAge, maxAge: rawMaxAge, questions} = getDeepQuery(req)

    // rawTenantId is a potentially-user-supplied string, so we should remove anything that isn't alphanumeric
    const tenantId = String(rawTenantId).replace(/[^a-zA-Z0-9]/g, '')

    const minAge = rawMinAge ? parseInt(String(rawMinAge)) : 0
    const maxAge = rawMaxAge ? parseInt(String(rawMaxAge)) : 999

    if (isNaN(minAge) || isNaN(maxAge)) {
        throw new Error('Invalid age parameters')
    }

    return `SELECT u.user_id::uuid AS id, u.created_at, u.updated_at, u.attributes, u.age
            FROM public.srv_channel_users AS u
            WHERE u."tenantId" = '${tenantId}'
              AND COALESCE(u.age:: smallint, 0) BETWEEN ${minAge} AND ${maxAge}
              AND ${buildCustomQuestionsUserFilter(`u.user_id::uuid`, questions)}
    `
}