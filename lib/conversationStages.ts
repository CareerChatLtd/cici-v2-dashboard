/**
 * Be sure to keep this in sync with the conversationStage enum in the database
 */
export const conversationStages = ['start', 'handover', 'after_topic'] as const;
export type ConversationStage = typeof conversationStages[number];

export const conversationStageNames: Record<ConversationStage, string> = {
    start: 'Start of conversation',
    handover: 'Before handover',
    after_topic: 'After topic',
};

export const conversationStageOptions = conversationStages.map(stage => ({
    value: stage,
    name: conversationStageNames[stage],
}));
