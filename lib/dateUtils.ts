import {DateTime} from "luxon";

export type DateRange = [Date | null, Date | null];

export const validateDateRangeStrings = (start: unknown, end: unknown) => {
    const datePattern = /\d{4}-\d{2}-\d{2}/
    const pass = () => ({valid: true, error: ''})
    const fail = (message: string) => ({valid: false, error: message})

    if (typeof start !== 'string') {
        return fail('Start parameter should be a string')
    }
    if (typeof end !== 'string') {
        return fail('End parameter should be a string')
    }

    if (!datePattern.test(start)) {
        return fail('Start parameter should be in YYYY-MM-DD format')
    }
    if (!datePattern.test(end)) {
        return fail('End parameter should be in YYYY-MM-DD format')
    }
    if (end < start) {
        return fail('End date should greater than the start date')
    }
    if (isNaN((new Date(start)).getTime())) {
        return fail('Start date is not valid')
    }
    if (isNaN((new Date(end)).getTime())) {
        return fail('End date is not valid')
    }

    return pass()
}

export const validateMonthString = (month: string | null | undefined) => {
    const pass = () => ({valid: true, error: ''})
    const fail = (message: string) => ({valid: false, error: message})

    if (month === undefined || month === null) {
        return fail('Parameter is missing')
    }
    const datePattern = /\d{4}-\d{2}/;
    if (!datePattern.test(month)) {
        return fail('Parameter should be in YYYY-MM format')
    }

    return pass()
}

export const addDayToDateString = (dateString: string): string => DateTime.fromISO(dateString).plus({day: 1}).toISODate()

export const addMonth = (month: string, months: number = 1) => {
    const date = new Date(month)
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 7)
}

export const friendlyDateRange = ([start, end]: [start: Date, end: Date]) => {
    const friendlyDate = (d: Date) => d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})
    return `${start ? friendlyDate(start) : ''} - ${end ? friendlyDate(end) : ''}`
}