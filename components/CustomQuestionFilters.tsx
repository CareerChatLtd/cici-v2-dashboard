import {useEffect, useState} from "react";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import {Question, Tenant} from "@/lib/types";
import {QuestionType} from "@/lib/questionTypes";
import {FormGroup} from "@blueprintjs/core";
import {useReportContext} from "@/components/ReportContextProvider";
import {YesNoFilter} from "@/components/YesNoFilter";
import {SingleChoiceFilter} from "@/components/SingleChoiceFilter";

const relevantQuestionTypeSlugs: QuestionType[] = ['singleChoice', 'multipleChoice', 'yesNo']

export const CustomQuestionFilters = ({tenant}: { tenant: Tenant }) => {
    const [questions, setQuestions] = useState<Array<Question>>([])
    const reportContext = useReportContext();

    // Get all questions for the current tenant from the api
    useEffect(() => {
        // Fetch our complete list of questions
        makeApiRequestForTenant(tenant.id, 'questions').then((data: Question[]) => {
            // Filter out questions that don't have preset answers
            setQuestions(data.filter(q => relevantQuestionTypeSlugs.includes(q.type)))
        })
    }, [])

    if (questions.length === 0) {
        return <p className="text-center">No questions available to use as filters</p>
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-gray-600 mb-3">Custom questions</h3>
            <div className="flex flex-row flex-wrap gap-5 justify-start">
                {questions.map(question => {
                    const existingValue = reportContext.customQuestions.get(question.id);
                    return (
                        <div className="flex-initial" key={question.id}>
                            <FormGroup
                                label={question.name}
                            >
                                {question.type === 'yesNo' ? (
                                        <YesNoFilter
                                            value={existingValue !== undefined ? Boolean(existingValue) : null}
                                            onChange={v => reportContext.setCustomQuestion(question.id, v)}
                                        />
                                    )
                                    : question.type === 'singleChoice' ? (
                                        <SingleChoiceFilter
                                            options={question.options.map(({id, text}) => [id, text])}
                                            value={existingValue ? Number(existingValue) : null}
                                            onChange={v => reportContext.setCustomQuestion(question.id, v)}
                                        />
                                    ) : question.type === 'multipleChoice' ? (
                                        <SingleChoiceFilter
                                            options={question.options.map(({id, text}) => [id, text])}
                                            value={Array.isArray(existingValue) ? existingValue[0] : null}
                                            onChange={v => reportContext.setCustomQuestion(question.id, v ? [v] : null)}
                                        />
                                    ) : null

                                }
                            </FormGroup>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
