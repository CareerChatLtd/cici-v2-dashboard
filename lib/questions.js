import {conversationStages} from "@/lib/conversationStages";
import {topics} from "@/lib/topics";

export const createQuestionValidator = ({questionTypes}) => ({
    id: (v) => {
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
    tenantId: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"tenantId" cannot be empty`);
        }
        if (!v.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error(`"tenantId" should contain only alpha-numeric characters`)
        }
    },
    name: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"Name" cannot be empty`)
        }
    },
    text: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"Name" cannot be empty`)
        }
    },
    responseText: () => {},

    conversationStage: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"conversationStage" cannot be empty`)
        }
        if (!conversationStages.includes(v)) {
            throw new Error(`"conversationStage" must be one of ${JSON.stringify(conversationStages)}`)
        }
    },
    includeInHandover: (v) => {
        if (typeof v !== 'boolean') {
            throw new Error(`"includeInHandover" must be a boolean`)
        }
    },
    typeId: (v) => {
        if (!v || !Number.isInteger(v)) {
            throw new Error(`"typeId" cannot be empty`)
        }
        if (!questionTypes.map(t => t.id).includes(v)) {
            throw new Error(`"typeId" must be one of ${JSON.stringify(questionTypes.map(t => t.id))}`)
        }
    },
    options: (v, data) => {
        const choiceTypeIds = questionTypes.filter(t => ['Single Choice', 'Multiple Choice'].includes(t.name)).map(t => t.id)

        // Only validate this if the question type is "Single Choice" or "Multiple Choice"
        if (!choiceTypeIds.includes(data.typeId)) {
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
    topics: v => {
        if (!Array.isArray(v)) {
            throw new Error('"topics" must be an array')
        }
        v.forEach((o, i) => {
            if (typeof o !== 'string') {
                throw new Error(`"topics[${i}]" must be a string`)
            }
            if (!Object.keys(topics).includes(o)) {
                throw new Error(`"topics[${i}]" is not a recognised topic ("${o}")`)
            }
        })
    },
})