import {ForwardedRef, forwardRef, useEffect, useState} from "react";
import {Button, Checkbox, FormGroup, Icon, InputGroup, MenuItem, Spinner} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";
import {SuccessBlock} from "@/lib/cms/success-block";
import {ErrorBlock} from "@/lib/cms/error-block";
import {useRouter} from "next/router";
import {conversationStageOptions} from "@/lib/conversationStages";
import {Question, Tenant} from "@/lib/types";
import {QuestionType, questionTypes} from "@/lib/questionTypes";

interface QuestionFormOption {
    id: number | null;
    text: string;
}

const emptyOption: QuestionFormOption = {
    id: null,
    text: '',
};

interface Props {
    question?: Question;
    tenant: Tenant;
    onLoading: (loading: boolean) => void;
}

export const QuestionForm = forwardRef(
    function (
        {
            question: existingQuestion,
            tenant,
            onLoading
        }: Props, ref: ForwardedRef<HTMLFormElement>
    ) {

        const [loading, setLoadingSetter] = useState(false)
        const [errorMessages, setErrorMessages] = useState([])
        const [successMessage, setSuccessMessage] = useState('')

        const initialState = existingQuestion ? {...existingQuestion} : {
            id: null,
            tenantId: tenant.id,
            name: '',
            text: '',
            type: null,
            includeInHandover: false,
            options: [{...emptyOption}],
            conversationStage: 'start',
        }
        // Be sure to remove internalRef if it has come from an existing question, as we never want this to be edited via the UI
        if ('internalRef' in initialState) {
            delete initialState.internalRef
        }

        const [question, setQuestion] = useState(initialState)

        const router = useRouter()

        const setLoading = (loading: boolean) => {
            setLoadingSetter(loading)
            onLoading(loading)
        }

        // Focus newly created option fields
        useEffect(() => {
            if (question.options.length) {
                // Autofocus the newly added option field
                // Not all question types will show these fields, hence the optional chaining
                const newInput = document.querySelector(`input[name="option-${question.options.length - 1}"]`) as HTMLInputElement | null
                newInput?.focus()
            }
        }, [question.options.length, question.type]);

        const save = (e) => {
            e.preventDefault()
            setLoading(true)

            const data = {
                ...question,
                tenantId: tenant.id,
            }

            fetch(`/api/upsert-question`, {
                method: 'POST', body: JSON.stringify(data),
            })
                .then((r) => r.json())
                .then(({errors = []}) => {
                    setLoading(false)
                    setErrorMessages(errors)
                    setSuccessMessage(errors.length ? '' : 'Question successfully saved')
                    if (!errors.length) {
                        setTimeout(() => {
                            // Return to questions list
                            router.push(`/tenants/${tenant.slug}/questions`)

                        }, 1000)
                    }
                })
                .catch((e) => {
                    setLoading(false)
                    setErrorMessages([e.message])
                });
        }

        const choiceTypeSlugs: QuestionType[] = ['singleChoice', 'multipleChoice']

        return loading ? <Spinner/>
            : successMessage.length ? <SuccessBlock successMessage={successMessage}/>
                : <>
                    <ErrorBlock errorMessages={errorMessages}/>
                    <form
                        id="new-question-form"
                        onSubmit={save}
                        action=""
                        ref={ref}
                    >
                        <div className="grid grid-cols-2 gap-x-5">
                            <div className={`max-w-xs`}>
                                <FormGroup
                                    label="Name"
                                    subLabel="A short reference - will not be shown to users"
                                    labelInfo="(required)"
                                >
                                    <InputGroup
                                        name="name"
                                        required={true}
                                        type="text"
                                        disabled={loading}
                                        defaultValue={question.name}
                                        onChange={(event) => {
                                            setQuestion({...question, name: event.target.value})
                                        }}
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Question Text"
                                    labelInfo="(required)"
                                >
                                    <InputGroup
                                        name="text"
                                        required={true}
                                        type="text"
                                        disabled={loading}
                                        defaultValue={question.text}
                                        onChange={(event) => {
                                            setQuestion({...question, text: event.target.value})
                                        }}
                                    />
                                </FormGroup>

                                <Checkbox
                                    name="includeInHandover"
                                    defaultChecked={question.includeInHandover}
                                    label={"Include in handover email?"}
                                    onChange={(event) => {
                                        setQuestion({...question, includeInHandover: event.target.checked})
                                    }}
                                />

                                <FormGroup
                                    label="When to ask"
                                    labelInfo="(required)"
                                >
                                    <Select
                                        items={conversationStageOptions}
                                        itemRenderer={(type, {handleClick}) => (
                                            <MenuItem
                                                text={type.name}
                                                key={type.value}
                                                onClick={handleClick}
                                            />
                                        )}
                                        onItemSelect={option => {
                                            setQuestion({...question, conversationStage: option.value})
                                        }}
                                        filterable={false}
                                    ><Button
                                        text={question.conversationStage ? conversationStageOptions.find(t => t.value === question.conversationStage).name : "Choose a stage"}
                                        endIcon={<Icon icon="caret-down"/>}/></Select>
                                </FormGroup>
                            </div>

                            <div className={`max-w-xs`}>

                                <FormGroup
                                    label="Question Type"
                                    labelInfo="(required)"
                                >
                                    <Select
                                        items={[...questionTypes]}
                                        itemRenderer={(type, {handleClick}) => (
                                            <MenuItem
                                                text={type.name}
                                                key={type.slug}
                                                onClick={handleClick}
                                                label={type.description}

                                            />
                                        )}
                                        onItemSelect={(type) => {
                                            setQuestion({...question, type: type.slug})
                                        }}
                                        filterable={false}
                                    >
                                        <Button
                                            text={question.type ? questionTypes.find(t => t.slug === question.type).name : "Choose a type"}
                                            endIcon={<Icon icon="caret-down"/>}/>
                                    </Select>
                                </FormGroup>

                                {choiceTypeSlugs.includes(question.type) &&
                                    <div className="my-4 mx-8">
                                        {question.options.map((option, index) => (

                                            <FormGroup
                                                label={`Option ${index + 1}: Text`}
                                                labelInfo="(required)"
                                                key={index}
                                            >
                                                <div className={`flex items-center`}>
                                                    <InputGroup
                                                        name={`option-${index}`}
                                                        required={true}
                                                        type="text"
                                                        disabled={loading}
                                                        value={option.text}
                                                        onChange={(event) => {
                                                            const newOptions = [...question.options]
                                                            newOptions[index].text = event.target.value
                                                            setQuestion({...question, options: newOptions})
                                                        }}
                                                    />

                                                    <Button
                                                        intent="danger"
                                                        icon="delete"
                                                        title="Delete option"
                                                        size="small"
                                                        className="mx-4"
                                                        variant="minimal"
                                                        onClick={() => {
                                                            setQuestion({
                                                                ...question,
                                                                options: question.options.filter((o, i) => i !== index),
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </FormGroup>

                                        ))}
                                        <Button
                                            onClick={() => {
                                                setQuestion({
                                                    ...question,
                                                    options: [...question.options, {...emptyOption}]
                                                })
                                            }}
                                            text="Add Option"
                                            icon="plus"
                                            intent="primary"
                                            size="small"
                                        />
                                    </div>
                                }

                            </div>
                        </div>
                    </form>
                </>
    })
