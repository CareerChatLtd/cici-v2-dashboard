import {Button, FocusStyleManager, Spinner} from '@blueprintjs/core'
import Header from "@/components/Header";
import {useEffect, useState} from "react";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import Head from "next/head";
import {extractFormData} from "@/lib/tenant";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import {TenantForm} from "@/components/TenantForm";
import {useRouter} from "next/router";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser, withTenant} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const TenantSettings = ({tenant}) => {
    const [questions, setQuestions] = useState([])
    const [dataVersion, setDataVersion] = useState(1)
    const [errorMessages, setErrorMessages] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        // Fetch our complete list of questions
        makeApiRequestForTenant(tenant.id, 'built-in-questions').then(data => {
            setQuestions(data)
        })
    }, [])

    // Scroll to top of page to show any success or error messages
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [successMessage, errorMessages])

    const loading = !questions.length

    const save = (e) => {
        e.preventDefault()
        const form = new FormData(e.target)
        const data = extractFormData(form)

        fetch(`/api/update-tenant?tenantId=${tenant.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(({data, errors}) => {
                setErrorMessages(errors ?? [])
                setSuccessMessage(errors ? '' : 'Tenant successfully updated')
                if (!errors) {
                    setTimeout(() => {
                        // Return to tenants list
                        router.push('/tenants')
                    }, 1000)
                }
            });
    }

    const archive = (e) => {
        e.preventDefault()
        if (confirm(`Are you sure you wish to delete ${tenant.name}?`)) {
            fetch(`/api/update-tenant?tenantId=${tenant.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({status: 'archived'}),
            })
                .then(res => res.json())
                .then(({data, errors}) => {
                    setErrorMessages(errors ?? [])
                    setSuccessMessage(errors ? '' : 'Tenant successfully archived')
                    if (!errors) {
                        setTimeout(() => {
                            // Return to tenants list
                            router.push('/tenants')
                        }, 1000)
                    }
                });
        }
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Settings - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    backLink="/tenants"
                    title={`Settings for ${tenant.name}`}
                    rightSlot={
                        <div className="flex gap-x-4 items-center">
                            <Button
                                loading={loading}
                                type="submit"
                                intent="primary"
                                text="Save"
                                icon="floppy-disk"
                                form="settings-form"
                            />
                        </div>
                    }
                />

                {loading ? <Spinner/>
                    :
                    <div>
                        <ErrorBlock errorMessages={errorMessages}/>
                        <SuccessBlock successMessage={successMessage}/>
                        <form id="settings-form" onSubmit={save} action="" key={dataVersion}>
                            <TenantForm
                                tenant={tenant}
                                questions={questions}
                            />
                        </form>
                        <Button
                            onClick={archive}
                            className="mt-8"
                            icon="trash"
                            small
                            intent="danger"
                            outlined>Archive</Button>
                    </div>
                }

            </div>
        </div>
    )
}

export default withAdminUser(withTenant(TenantSettings, true))
