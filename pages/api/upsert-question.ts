import {withAdminCheck} from "@/lib/auth";
import {createQuestionValidator} from "@/lib/questions";
import {NextApiRequest, NextApiResponse} from "next/types";
import {knex} from "@/lib/knex";
import {Question, QuestionOption} from "@/lib/types";
import {QuestionType, QuestionTypeId} from "@/lib/questionTypes";

interface OptionRequest {
    id: number | null;
    questionId: number;
    text: string;
}

interface QuestionRequest {
    id: number | null;
    tenantId: string;
    name: string;
    text: string;
    conversationStage: 'start' | 'handover' | 'after_topic';
    includeInHandover: boolean;
    typeId: QuestionTypeId;
    options: OptionRequest[];
    topics: string[];
}

export default withAdminCheck(async (req: NextApiRequest, res: NextApiResponse) => {

    const questionTypes = await knex<QuestionType>('cici.question_types')

    const rawData = JSON.parse(req.body)

    // Trim all strings
    const trimmedData = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string') ? v.trim() : v
    })

    const validated = {}
    const errors = []

    // Validate data
    const validator = createQuestionValidator({questionTypes})
    Object.entries(trimmedData).forEach(([k, v]) => {
        try {
            // Reject anything that doesn't have a validator
            if (!Object.keys(validator).includes(k)) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(`Unknown field "${k}" supplied`)
            }
            // Try validating - will throw an error if it fails
            validator[k](v, trimmedData)
            validated[k] = v
        } catch (e) {
            errors.push(e.message)
        }

    })
    if (errors.length) {
        return res.status(400).json({errors})
    }

    // Remove options and topics fields as these are saved in separate tables
    const {options: optionsData = [], topics: topicsData = [], ...questionData} = validated as QuestionRequest


    try {
        const {id, ...otherData} = questionData

        // Save question data to database
        const question = id
            ? await knex<Question>('cici.questions')
                .where('id', id)
                .update(otherData)
                .returning('*')
                .then(r => r[0])
            : await knex<Question>('cici.questions')
                .insert(otherData)
                .returning('*')
                .then(r => r[0])
        const questionId = question.id
        question.options = []

        // Save options data to database

        const choiceTypeIds = questionTypes.filter(t => ['Single Choice', 'Multiple Choice'].includes(t.name)).map(t => t.id)

        if (choiceTypeIds.includes(questionData.typeId) && optionsData.length > 0) {

            const optionsWithQuestionId = optionsData.map(option => ({...option, questionId}))
            const optionsWithId = optionsWithQuestionId.filter((row) => row.id !== null);
            const optionsWithoutId = optionsWithQuestionId
                .filter((row) => row.id === null)
                .map(({questionId, text}) => ({questionId, text}));

            // Delete any existing options for this question that are no longer in the request
            const optionIds = optionsWithId.map(o => o.id)
            await knex('cici.question_options')
                .where('questionId', questionId)
                .whereNotIn('id', optionIds)
                .delete()

            if (optionsWithId.length > 0) {
                // Update existing options
                await Promise.all(optionsWithId.map(async (option) => {
                    const {id, text} = option
                    return knex('cici.question_options')
                        .where('id', id)
                        .where('questionId', questionId)
                        .update({text})
                }))
            }

            if (optionsWithoutId.length > 0) {
                // Insert new options
                await knex('cici.question_options').insert(optionsWithoutId)
            }

            // Fetch all options for this question
            question.options = await knex<QuestionOption>('cici.question_options')
                .where('questionId', questionId)
                .select('id', 'questionId', 'text')
                .orderBy('id');
        }

        question.topics = topicsData;

        // Delete any existing topics
        await knex('cici.question_topics').where('questionId', questionId).delete()

        // Insert the new topics
        if (topicsData.length > 0) {
            // Add questionId FK to each topic
            await Promise.all(topicsData.map(async (topicId) => {
                    const topic = {questionId, topicId}
                    return knex('cici.question_topics')
                        .insert(topic)
                        .returning('*')
                })
            )
        }

        return res.status(200).json({data: question});
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({errors: [err.message]})
    }
})
