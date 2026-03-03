import {QuestionType} from "@/lib/questionTypes";

export interface Tenant {
    id: number;
    slug: string;
    shortSlug: string;
    name: string;
    intro: string;
    status: 'active' | 'inactive' | 'archived';
    website: string;
    handoverEmail: string;
    handoverAskForPhoneNumber: boolean;
    handoverAskForStudentNumber: boolean;
    handoverSuccessMessage: string;
    passcode: string;
    safeguardingMessageLow: string | null;
    safeguardingMessageHigh: string | null;
    userSituation: 'school' | 'college' | 'university' | 'working' | 'lookingForWork' | 'other' | null;
    usersAreUnder18: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    id: number;
    internalRef: string | null;
    tenantId: number;
    name: string;
    text: string;
    type: QuestionType;
    includeInHandover: boolean;
    conversationStage: 'start' | 'handover';
    options: Array<QuestionOption>;
}

export interface QuestionOption {
    id: number;
    questionId?: number;
    text: string;
    internalRef?: string | null;
}

