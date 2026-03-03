import {Button, FocusStyleManager} from '@blueprintjs/core'
import Head from "next/head";
import Header from "@/components/Header";
import ScreenHeader from "@/components/ScreenHeader";
import {QuestionForm} from "@/components/QuestionForm";
import {useRef, useState} from "react";
import {withAdminUser, withTenant} from "@/lib/auth";
import {Tenant} from "@/lib/types";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const NewQuestion = ({tenant}: {tenant: Tenant}) => {
    const ref = useRef<HTMLFormElement>(null)

    const [loading, setLoading] = useState(false)

    const onLoading = (loading: boolean) => {
        setLoading(loading)
    }

    return (<div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
        <Head>
            <title>Add Question - CiCi Dashboard</title>
        </Head>
        <Header tenant={tenant}/>

        <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
            <ScreenHeader
                backLink={`/tenants/${tenant.slug}/questions`}
                title="Add Question"
                rightSlot={<Button
                    loading={loading}
                    intent="primary"
                    text="Save"
                    icon="floppy-disk"
                    onClick={() => ref.current?.requestSubmit()}
                />}
            />

            <QuestionForm {...{tenant, onLoading, ref}} />
        </div>
    </div>)
}

export default withAdminUser(withTenant(NewQuestion, true))
