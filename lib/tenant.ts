import {makeEmptyStringNull, validateEmail} from "./stringUtils";

export const extractFormData = (form: FormData) => {
    return {
        slug: form.get('slug'),
        shortSlug: makeEmptyStringNull(form.get('shortSlug')),
        name: form.get('name'),
        website: makeEmptyStringNull(form.get('website')),
        intro: makeEmptyStringNull(form.get('intro')),
        handoverEmail: makeEmptyStringNull(form.get('handoverEmail')),
        handoverAskForPhoneNumber: form.has('handoverAskForPhoneNumber'),
        handoverAskForStudentNumber: form.has('handoverAskForStudentNumber'),
        handoverSuccessMessage: makeEmptyStringNull(form.get('handoverSuccessMessage')),
        passcode: makeEmptyStringNull(form.get('passcode')),
        safeguardingMessageLow: makeEmptyStringNull(form.get('safeguardingMessageLow')),
        safeguardingMessageHigh: makeEmptyStringNull(form.get('safeguardingMessageHigh')),
        usersAreUnder18: form.has('usersAreUnder18'),
    }
}

export const createTenantValidator = ({existingShortSlugs}) => ({
    slug: (v: unknown) => {
        if (typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"Slug" cannot be empty`)
        }
        if (!v.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error(`"Slug" should contain only alpha-numeric characters`)
        }
    },
    shortSlug: (v: unknown) => {
        if (typeof v !== 'string') {
            throw new Error(`"Slug" cannot be empty`)
        }
        if (!v.match(/^[a-zA-Z0-9]+$/)) {
            throw new Error(`"Short Slug" should contain only alpha-numeric characters`)
        }
        if (existingShortSlugs.includes(v)) {
            throw new Error(`"Short Slug" is already in use by another tenant`)
        }
    },
    name: (v: unknown) => {
        if (typeof v !== 'string' || v.trim().length === 0) {
            throw new Error(`"Name" cannot be empty`)
        }
    },
    website: (v: unknown) => {
        if (typeof v === 'string' && v.trim().length > 0) {
            try {
                new URL(v);
            } catch (_) {
                throw new Error('"Website" must be a valid URL or empty')
            }
        }
    },
    intro: (v: unknown) => {
        if (typeof v === 'string' && v.trim().length > 200) {
            throw new Error('"Intro" looks a little long for a greeting')
        }
    },
    handoverEmail: (v: unknown) => {
        if (v && !validateEmail(v)) {
            throw new Error(`"Handover email" doesn't appear to be valid`)
        }
    },
    handoverAskForPhoneNumber: () => {
    },
    handoverAskForStudentNumber: () => {
    },
    handoverSuccessMessage: () => {
    },
    passcode: (v: unknown) => {
        if (typeof v === 'string' && !v.match(/^[0-9]{4}$/)) {
            throw new Error(`"Passcode" should be a 4 digit number`)
        }
    },
    status: (v: unknown) => {
        if (typeof v === 'string' && !['active', 'inactive', 'archived'].includes(v)) {
            throw new Error(`Invalid status ${v} supplied`)
        }
    },
    safeguardingMessageLow: (v: unknown) => {
        if (typeof v === 'string' && v.trim().length > 1000) {
            throw new Error('"Safeguarding message (low risk)" should be less than 1000 characters')
        }
    },
    safeguardingMessageHigh: (v: unknown) => {
        if (typeof v === 'string' && v.trim().length > 1000) {
            throw new Error('"Safeguarding message (high risk)" should be less than 1000 characters')
        }
    },
    usersAreUnder18: (v: unknown) => {
        if (typeof v !== 'boolean') {
            throw new Error('"Users are under 18" must be a boolean value')
        }
    }
})
