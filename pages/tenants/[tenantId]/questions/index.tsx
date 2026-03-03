import {AnchorButton, Button, FocusStyleManager, Icon} from '@blueprintjs/core'
import Head from "next/head";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import Header from "@/components/Header";
import ScreenHeader from "@/components/ScreenHeader";

import {withAdminUser, withTenant} from "@/lib/auth";
import {snakeToSentenceCase} from "@/lib/stringUtils";
import {Question, Tenant} from "@/lib/types";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const ListQuestions = ({tenant}: {tenant: Tenant}) => {
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([])

    // Get all questions for the current tenant from the api
    useEffect(() => {
        // Fetch our complete list of questions
        makeApiRequestForTenant(tenant.id, 'questions').then(data => {
            setQuestions(data)
        })
    }, [])

    const confirmDelete = (question: Question) => () => {
        const showError = (error: unknown) => {
            console.error(error)
            alert(`There was an error deleting the question "${question.name}"`)
        }
        if (confirm(`Are you sure you want to delete the question "${question.name}"?`)) {
            makeApiRequestForTenant(tenant.id, 'delete-question', {id: question.id})
                .then(() => {
                    // Remove the question from the list
                    setQuestions(questions.filter(q => q.id !== question.id))
                })
                .catch(error => {
                    console.log('catch', {error});
                    showError(error)
                });
        }
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Questions - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <ScreenHeader
                    title={`Questions for ${tenant.name}`}
                    backLink={`/tenants/${tenant.slug}`}
                    rightSlot={
                        <AnchorButton
                            type="submit"
                            intent="primary"
                            text="Add Question"
                            icon="cube-add"
                            onClick={() => router.push(`/tenants/${tenant.slug}/questions/new`)}
                        />
                    }
                />

                {questions.length === 0 ? <p>No questions currently set up yet</p>
                    :
                    <table
                        className="bp3-html-table bp3-html-table-bordered bp3-html-table-striped bp3-interactive w-full">
                        <thead>
                        <tr>
                            <th className="text-left px-3 py-2">Name</th>
                            <th className="text-left px-3 py-2 hidden md:table-cell">Text</th>
                            <th className="text-center px-3 py-2">Type</th>
                            <th className="text-center px-3 py-2 hidden md:table-cell">Include in handover?</th>
                            <th className="text-center px-3 py-2 hidden md:table-cell">Conversation stage</th>
                            <th className="text-center px-3 py-2">Actions</th>
                        </tr>

                        </thead>
                        <tbody>
                        {questions.map((question, i) => (
                            <tr className="border-gray-300 border-t hover:bg-gray-100" key={i}>
                                <td className="text-left px-3 py-2">{question.name}</td>
                                <td className="text-left px-3 py-2 hidden md:table-cell">{question.text}</td>
                                <td className="text-center px-3 py-2">{question.type}</td>
                                <td className="text-center px-3 py-2 hidden md:table-cell">{question.includeInHandover
                                    ? <Icon icon="tick"/> : <Icon icon="cross" color="#AAA"/>}</td>
                                <td className="text-center px-3 py-2 hidden md:table-cell">{snakeToSentenceCase(question.conversationStage)}</td>
                                <td className="flex gap-2 justify-center px-3 py-2">
                                    <AnchorButton
                                        type="submit"
                                        intent="primary"
                                        text="Edit"
                                        icon="edit"
                                        size={'small'}
                                        onClick={() => router.push(`/tenants/${tenant.slug}/questions/${question.id}`)}
                                    />
                                    <Button
                                        intent="danger"
                                        icon="delete"
                                        title="Delete question"
                                        size={'small'}
                                        variant={'minimal'}
                                        onClick={confirmDelete(question)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                }

            </div>
        </div>
    )
}

export default withAdminUser(withTenant(ListQuestions, true))
