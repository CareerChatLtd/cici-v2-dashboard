// Be sure to keep this in sync with the question_types table in the database
export const questionTypes = [
    {
        id: 1,
        name: 'Text',
        description: 'Open-ended questions allowing free text responses'
    },
    {
        id: 2,
        name: 'Yes/No',
        description: 'Questions that require a yes or no response'
    },
    {
        id: 3,
        name: 'Single Choice',
        description: 'Preset options where only one can be chosen'
    },
    {
        id: 4,
        name: 'Multiple Choice',
        description: 'Preset options where multiple can be chosen'
    }
] as const

export type QuestionType = typeof questionTypes[number]
export type QuestionTypeId = QuestionType['id']
export type QuestionTypeName = QuestionType['name']