import {Button, FocusStyleManager} from '@blueprintjs/core'
import Head from "next/head";
import Header from "@/components/Header";
import ScreenHeader from "@/components/ScreenHeader";
import {QuestionForm} from "@/components/QuestionForm";
import {useRef, useState} from "react";
import {withAdminUser, withTenant} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const NewQuestion = ({tenant}) => {
    const ref = useRef(null)

    const [loading, setLoading] = useState(false)

    const onLoading = (loading) => {
        setLoading(loading)
    }

    return (<div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
        <Head>
            <title>Add Question - CiCi Dashboard</title>
        </Head>
        <Header tenant={tenant}/>

        <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
            <ScreenHeader
                backLink={`/tenants/${tenant.id}/questions`}
                title="Add Question"
                rightSlot={<Button
                    loading={loading}
                    intent="primary"
                    text="Save"
                    icon="floppy-disk"
                    onClick={() => ref.current.requestSubmit()}
                />}
            />

            <QuestionForm {...{tenant, onLoading, ref}} />
        </div>
    </div>)
}

export default withAdminUser(withTenant(NewQuestion, true))
