import {Button, FocusStyleManager} from '@blueprintjs/core'
import {useState} from "react";
import Head from "next/head";
import Header from "@/components/Header";
import {extractFormData} from "@/lib/tenant";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import {TenantForm} from "@/components/TenantForm";
import {useRouter} from "next/router";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser} from "@/lib/auth";
import {Tenant} from "@/lib/types";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const NewTenant = () => {
    const router = useRouter()

    const [errorMessages, setErrorMessages] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const [newTenant, setNewTenant] = useState<Tenant>({} as Tenant)

    const save = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)

        const data = extractFormData(form)

        fetch(`/api/add-tenant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(({data, errors}) => {
                setErrorMessages(errors ?? [])
                setSuccessMessage(errors ? '' : 'Tenant successfully added')
                if (!errors) {
                    setNewTenant(data)
                    localStorage.setItem('tenantId', data.id);
                    setTimeout(() => {
                        router.push('/tenants')
                    }, 1500)
                }
            });
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Add Tenant - CiCi Dashboard</title>
            </Head>
            <Header/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    backLink="/tenants"
                    title={`Add Tenant`}
                    rightSlot={
                        !newTenant.id &&
                        <Button
                            type="submit"
                            intent="primary"
                            icon="floppy-disk"
                            text="Save"
                            form="new-tenant-form"
                        />
                    }
                />


                <div>

                    <ErrorBlock errorMessages={errorMessages}/>
                    <SuccessBlock successMessage={successMessage}/>

                    {newTenant.id
                        ?
                        <></>
                        :
                        <form
                            id="new-tenant-form"
                            onSubmit={save}
                            action=""
                        >
                            <TenantForm
                                tenant={newTenant}
                            />
                        </form>
                    }

                </div>

            </div>
        </div>
    )
}

export default withAdminUser(NewTenant)
