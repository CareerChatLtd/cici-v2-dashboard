import {Button, FocusStyleManager} from '@blueprintjs/core'
import Head from "next/head";
import Header from "@/components/Header";
import {useRouter} from "next/router";
import ScreenHeader from "@/components/ScreenHeader";
import {QuestionForm} from "@/components/QuestionForm";
import {useEffect, useRef, useState} from "react";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import {withAdminUser, withTenant} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const EditQuestion = ({tenant}) => {
    const router = useRouter()
    const ref = useRef(null)
    const id = router.query.questionId

    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState(null)

    useEffect(() => {
        // Fetch our complete list of topics
        makeApiRequestForTenant(tenant.id, 'question', {id}).then(data => {
            setQuestion(data)
        })
    }, [])

    const onLoading = (loading) => {
        setLoading(loading)
    }

    return (<div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
        <Head>
            <title>Edit Question - CiCi Dashboard</title>
        </Head>
        <Header tenant={tenant}/>

        <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
            <ScreenHeader
                backLink={`/tenants/${tenant.id}/questions`}
                title="Edit Question"
                rightSlot={<Button
                    loading={loading}
                    intent="primary"
                    text="Save"
                    icon="floppy-disk"
                    onClick={() => ref.current.requestSubmit()}
                />}
            />

            {question && <QuestionForm {...{question, tenant, onLoading, ref}} />}
        </div>
    </div>)
}

export default withAdminUser(withTenant(EditQuestion, true))
