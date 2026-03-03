export type QuestionType = "text" | "yesNo" | "singleChoice" | "multipleChoice"

export const questionTypes: Array<{ slug: QuestionType, name: string, description: string }> = [
    {
        slug: 'text',
        name: 'Text',
        description: 'Open-ended questions allowing free text responses'
    },
    {
        slug: 'yesNo',
        name: 'Yes/No',
        description: 'Questions that require a yes or no response'
    },
    {
        slug: 'singleChoice',
        name: 'Single Choice',
        description: 'Preset options where only one can be chosen'
    },
    {
        slug: 'multipleChoice',
        name: 'Multiple Choice',
        description: 'Preset options where multiple can be chosen'
    }
]
