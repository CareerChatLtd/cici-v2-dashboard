// Be sure to keep this in sync with the 'question' enum in the database
export const validQuestions = [
    'employmentStatus',
    'careerStatus',
    // not 'age', as this needs special grouping
    'gender',
    'highestQualification',
    'ethnicity',
    'londonBorough',
    'isEnrolled',
    'firstPartOfPostcode',
] as const;

export type BuiltInQuestion = typeof validQuestions[number];

export const getBuiltInQuestionEndpoint = (question: BuiltInQuestion) => `built-in-question-report?question=${question}`;

export type BuiltInQuestionReportData = Array<{ name: string | null, count: number, percent: number }>;

// Where our backend endpoint returns us data keyed by internal names, apply their equivalent friendly name
export const applyFriendlyNames = (data: BuiltInQuestionReportData, names?: Record<string, string>) => {

    // If the backend hasn't returned any data for one of our names, add it to the list
    const missingNames = names ? Object.keys(names).filter(name => !data.some(x => x.name === name)) : []
    const completeData = [...data, ...missingNames.map(name => ({name, count: 0, percent: 0}))]

    // Apply the friendly names
    return completeData.map(({name, count, percent}) => ({
        name: names ? names[name] ?? 'Unknown' : name === null ? 'Unknown' : name,
        count,
        percent,
    }))
}

export const hasNoData = (data: BuiltInQuestionReportData) => data.reduce((acc, {count}) => acc + count, 0) === 0