import {QuestionTypeId} from "@/lib/questionTypes";

export interface Tenant {
    id: string;
    name: string;
    shortId: string;
    intro: string;
    questions: string[];
    status: 'active' | 'inactive' | 'archived';
    website: string;
    apprenticeshipUkprn: string;
    hideTopics: string[];
    handoverEmail: string;
    handoverAskForFullName: boolean;
    handoverAskForPhoneNumber: boolean;
    handoverAskForStudentNumber: boolean;
    handoverSuccessMessage: string;
    passcode: string;
    disclaimer: string | null;
    safeguardingMessageLow: string | null;
    safeguardingMessageHigh: string | null;
    usersAreUnder18: boolean;
}

export interface Question {
    id: number;
    ref: string | null;
    tenantId: string;
    name: string;
    text: string;
    typeId: QuestionTypeId;
    includeInHandover: boolean;
    conversationStage: 'start' | 'handover' | 'after_topic';
    options: Array<QuestionOption>;
    topics: Array<string>
    responseText: string | null;
}

export interface QuestionOption {
    id: number;
    questionId: number;
    text: string;
}

