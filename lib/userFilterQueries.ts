import {ParsedQs} from "qs";
import {NextApiRequest} from "next";
import {getDeepQuery} from "@/lib/apiUtils";

const singleChoiceUserSelection = (userId: string, questionId: number, optionId: number) => {
    return `SELECT 1
            FROM answer AS ur
            WHERE ur."questionId" = ${questionId}
              AND ur."questionOptionId" = ${optionId}
              AND ur."userId" = ${userId}`
}

const multipleChoiceUserSelection = (userId: string, questionId: number, optionId: number) => {
    return `SELECT 1
            FROM answer AS ur
                     join "answerOption" AS uro on uro."answerId" = ur.id
            WHERE ur."questionId" = ${questionId}
              AND uro."questionOptionId" = ${optionId}
              AND ur."userId" = ${userId}`
}

const yesNoUserSelection = (userId: string, questionId: number, booleanValue: boolean) => {
    return `SELECT 1
            FROM answer AS ur
            WHERE ur."questionId" = ${questionId}
              AND ur."booleanValue" = ${booleanValue ? 'true' : 'false'}
              AND ur."userId" = ${userId}`
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
export const getFilteredUsersCte = (req: NextApiRequest) => {

    const {tenantId: rawTenantId, questions} = getDeepQuery(req)

    // rawTenantId is a potentially-user-supplied value, so we validate it as a number
    const tenantId = Number(rawTenantId)
    if (isNaN(tenantId)) {
        throw new Error('tenantId must be a number')
    }

    return `SELECT u."id", u."createdAt" AS created_at
            FROM "user" AS u
            WHERE u."tenantId" = ${tenantId}
              AND ${buildCustomQuestionsUserFilter(`u."id"`, questions)}
    `
}