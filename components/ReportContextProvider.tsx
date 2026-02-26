import React, {useState} from 'react'
import {DateRange} from "@/lib/dateUtils";
import {AgeBracket} from "@/lib/ages";
import {DateTime} from "luxon";

// By default, set our date range to the past month
const tz = 'Europe/London'
const defaultStart = DateTime.now().setZone(tz).minus({month: 1}).plus({day: 1}).toJSDate()
const defaultEnd = DateTime.now().setZone(tz).toJSDate()

type QuestionId = number;
type QuestionOptionId = number;
type AnswerValue = Array<QuestionOptionId> | QuestionOptionId | true | false;
export type CustomQuestions = Map<QuestionId, AnswerValue>;

interface ReportContextInterface {
    tenantId: string;
    setTenantId: (id: string) => void;
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    ageBracket: AgeBracket;
    setAgeBracket: (age: AgeBracket) => void;
    customQuestions: CustomQuestions;
    setCustomQuestion: (questionId: QuestionId, answer: AnswerValue | null) => void;
    filterCount: number;
    clearFilters: () => void;
}

const ReportContext = React.createContext(null as ReportContextInterface | null);

// A React context provider component that gives access to ageBracket, tenantId, and dateRange
export const ReportContextProvider = ({children}) => {
    const [tenantId, setTenantId] = useState<string>(null)
    const [dateRange, setDateRange] = useState<DateRange>([defaultStart, defaultEnd])
    const [ageBracket, setAgeBracket] = useState<AgeBracket>(null)
    const [customQuestions, setCustomQuestions] = useState<CustomQuestions>(new Map())

    const setCustomQuestion = (questionId: QuestionId, answer: AnswerValue | null) => {
        const newMap = new Map(customQuestions)
        if (answer === null) {
            newMap.delete(questionId)
        } else {
            newMap.set(questionId, answer)
        }
        setCustomQuestions(newMap)
    }

    const clearFilters = () => {
        setAgeBracket(null)
        setCustomQuestions(new Map())
    }

    const filterCount = customQuestions.size + (ageBracket ? 1 : 0)

    return <ReportContext.Provider value={{
        clearFilters, tenantId, setTenantId, dateRange, setDateRange, ageBracket, setAgeBracket,
        customQuestions, setCustomQuestion, filterCount
    }}>
        {children}
    </ReportContext.Provider>
}

// A hook to access the report context
export const useReportContext = () => {
    const context = React.useContext(ReportContext)
    if (!context) {
        throw new Error('useReportContext must be used within a ReportContextProvider')
    }
    return context
}