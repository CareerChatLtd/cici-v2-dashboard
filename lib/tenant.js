import {makeEmptyStringNull, validateEmail} from "./stringUtils";
import {topics} from "@/lib/topics";

/**
 * @param {FormData} form
 */
export const extractFormData = form => {
    return {
        id: form.get('id'),
        shortId: makeEmptyStringNull(form.get('shortId')),
        name: form.get('name'),
        website: makeEmptyStringNull(form.get('website')),
        intro: makeEmptyStringNull(form.get('intro')),
        questions: form.getAll('questions'),
        apprenticeshipUkprn: makeEmptyStringNull(form.get('apprenticeshipUkprn')),
        hideTopics: form.getAll('hideTopics'),
        handoverEmail: makeEmptyStringNull(form.get('handoverEmail')),
        handoverAskForFullName: form.has('handoverAskForFullName'),
        handoverAskForPhoneNumber: form.has('handoverAskForPhoneNumber'),
        handoverAskForStudentNumber: form.has('handoverAskForStudentNumber'),
        handoverSuccessMessage: makeEmptyStringNull(form.get('handoverSuccessMessage')),
        passcode: makeEmptyStringNull(form.get('passcode')),
        disclaimer: makeEmptyStringNull(form.get('disclaimer')),
        safeguardingMessageLow: makeEmptyStringNull(form.get('safeguardingMessageLow')),
        safeguardingMessageHigh: makeEmptyStringNull(form.get('safeguardingMessageHigh')),
        usersAreUnder18: form.has('usersAreUnder18'),
    }
}

const topicKeys = Object.keys(topics)

export const createTenantValidator = ({questions, existingShortIds}) => ({
    id: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"ID" cannot be empty`)
        }
        if (!v.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error(`"ID" should contain only alpha-numeric characters`)
        }
    },
    shortId: (v) => {
        if (v && !v.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error(`"Short ID" should contain only alpha-numeric characters`)
        }
        if (v && existingShortIds.includes(v)) {
            throw new Error(`"Short ID" is already in use by another tenant`)
        }
    },
    name: (v) => {
        if (!v || v.trim().length === 0) {
            throw new Error(`"Name" cannot be empty`)
        }
    },
    website: (v) => {
        if (v && v.trim().length > 0) {
            try {
                new URL(v);
            } catch (_) {
                throw new Error('"Website" must be a valid URL or empty')
            }
        }
    },
    intro: (v) => {
        if (v && v.trim().length > 200) {
            throw new Error('"Intro" looks a little long for a greeting')
        }
    },
    disclaimer: (v) => {
        if (v && v.trim().length > 1000) {
            throw new Error('"Disclaimer" should be less than 1000 characters')
        }
    },
    questions: (v) => {
        const unknownQuestions = v.filter(q => !questions.includes(q))
        if (unknownQuestions.length) {
            throw new Error(`The following questions were not recognised: ${JSON.stringify(unknownQuestions)}`)
        }
    },
    apprenticeshipUkprn: (v) => {
        if (v && (v.length > 8 || v.length < 8 || v.charAt(0) !== '1')) {
            throw new Error('"UKPRN" should be 8 digits and start with a "1"')
        }
    },
    hideTopics: (v) => {
        const unknownTopicKeys = v.filter(t => !topicKeys.includes(t))
        if (unknownTopicKeys.length) {
            throw new Error(`The following topics were not recognised: ${JSON.stringify(unknownTopicKeys)}`)
        }
    },
    handoverEmail: (v) => {
        if (v && !validateEmail(v)) {
            throw new Error(`"Handover email" doesn't appear to be valid`)
        }
    },
    handoverAskForFullName: (v) => {

    },
    handoverAskForPhoneNumber: (v) => {

    },
    handoverAskForStudentNumber: (v) => {

    },
    handoverSuccessMessage: (v) => {

    },
    passcode: (v) => {
        if (v && !v.match(/^[0-9]{4}$/)) {
            throw new Error(`"Passcode" should be a 4 digit number`)
        }
    },
    status: (v) => {
        if (v && !['active', 'inactive', 'archived'].includes(v)) {
            throw new Error(`Invalid status ${v} supplied`)
        }
    },
    safeguardingMessageLow: (v) => {
        if (v && v.trim().length > 1000) {
            throw new Error('"Safeguarding message (low risk)" should be less than 1000 characters')
        }
    },
    safeguardingMessageHigh: (v) => {
        if (v && v.trim().length > 1000) {
            throw new Error('"Safeguarding message (high risk)" should be less than 1000 characters')
        }
    },
    usersAreUnder18: (v) => {
        if (typeof v !== 'boolean') {
            throw new Error('"Users are under 18" must be a boolean value')
        }
    }
})

