/**
 * Be sure to keep this in sync with the conversationStage check constraint in the database
 */
export const conversationStages = ['start', 'handover'] as const;
export type ConversationStage = typeof conversationStages[number];

export const conversationStageNames: Record<ConversationStage, string> = {
    start: 'Start of conversation',
    handover: 'Before handover',
};

export const conversationStageOptions = conversationStages.map(stage => ({
    value: stage,
    name: conversationStageNames[stage],
}));
