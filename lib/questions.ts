import {ConversationStage, conversationStages} from "@/lib/conversationStages";
import {QuestionType} from "@/lib/questionTypes";

export const createQuestionValidator = ({questionTypes}) => ({
    id: (v: unknown) => {
        if (v === null) {
            return
        }
        if (!v || String(v).trim().length === 0) {
            throw new Error(`"id" cannot be empty`);
        }
        if (!String(v).match(/^[0-9]+$/)) {
            throw new Error(`"id" should contain only numeric characters`)
        }
    },
    tenantId: (v: unknown) => {
        if (!v && v !== 0) {
            throw new Error(`"tenantId" cannot be empty`);
        }
        if (typeof v !== 'number' && typeof v !== 'string') {
            throw new Error(`"tenantId" must be a number`);
        }
        if (!String(v).match(/^[0-9]+$/)) {
            throw new Error(`"tenantId" must be numeric`)
        }
    },
    name: (v: unknown) => {
        if (!v || typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"Name" cannot be empty`)
        }
    },
    text: (v: unknown) => {
        if (!v || typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"Text" cannot be empty`)
        }
    },

    conversationStage: (v: unknown) => {
        if (!v || typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"conversationStage" cannot be empty`)
        }
        if (!conversationStages.includes(v as ConversationStage)) {
            throw new Error(`"conversationStage" must be one of ${JSON.stringify(conversationStages)}`)
        }
    },
    includeInHandover: (v: unknown) => {
        if (typeof v !== 'boolean') {
            throw new Error(`"includeInHandover" must be a boolean`)
        }
    },
    type: (v: unknown) => {
        if (!v || typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"type" cannot be empty`)
        }
        const validSlugs = questionTypes.map(t => t.slug)
        if (!validSlugs.includes(v)) {
            throw new Error(`"type" must be one of ${JSON.stringify(validSlugs)}`)
        }
    },
    options: (v: unknown, data: unknown) => {
        if (typeof data !== 'object' || data === null || !('type' in data) || typeof data.type !== 'string') {
            return
        }
        const choiceSlugs: QuestionType[] = ['singleChoice', 'multipleChoice'];

        // Only validate this if the question type is "Single Choice" or "Multiple Choice"
        if (!choiceSlugs.includes(data.type as QuestionType)) {
            return
        }
        if (!Array.isArray(v)) {
            throw new Error(`"options" must be an array`)
        }
        // Check that the array only contains objects matching the following shape:
        // { id: number, text: string }
        v.forEach((o, i) => {
            if (typeof o !== 'object') {
                throw new Error(`"options[${i}]" must be an object`)
            }
            if (typeof o.id !== 'number' && o.id !== null) {
                throw new Error(`"options[${i}].id" must be a number or null`)
            }
            if (typeof o.text !== 'string' || o.text.trim().length === 0) {
                throw new Error(`"options[${i}].text" must be a non-empty string`)
            }
        })
        // Check that each 'text' property is unique
        const texts = v.map(o => o.text)
        if (texts.length !== new Set(texts).size) {
            throw new Error(`"options" must contain unique 'text' properties`)
        }
    },
})
