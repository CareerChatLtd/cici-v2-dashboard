import {Button, FocusStyleManager, FormGroup, InputGroup, Spinner} from '@blueprintjs/core'
import {useState} from "react";
import Head from "next/head";
import Header from "@/components/Header";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import {useRouter} from "next/router";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser, withTenant} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const NewUser = ({tenant}) => {
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    const [successMessage, setSuccessMessage] = useState('')

    const save = (e) => {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.target)

        const data = {
            email: form.get('email'),
            password: form.get('password'),
        }

        fetch(`/api/add-user?tenantId=${tenant.id}`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
            .then((r) => r.json())
            .then(({error = null}) => {
                setLoading(false)
                setErrorMessages(error ? [error] : [])
                setSuccessMessage(error ? '' : 'User successfully added')
                if (!error) {
                    setTimeout(() => {
                        // Return to users list
                        router.push(`/tenants/${tenant.id}/users`)
                    }, 1000)
                }
            });
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Add User - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <ScreenHeader
                    backLink={`/tenants/${tenant.id}/users`}
                    title="Add User"
                    rightSlot={
                        !successMessage.length &&
                        <Button
                            loading={loading}
                            type="submit"
                            intent="primary"
                            text="Save"
                            icon="floppy-disk"
                            form="new-user-form"
                        />
                    }
                />

                {loading
                    ? <Spinner/>
                    : <div>
                        <ErrorBlock errorMessages={errorMessages}/>
                        <SuccessBlock successMessage={successMessage}/>
                    </div>
                }
                <div>
                    {successMessage ? '' :
                        <form
                            id="new-user-form"
                            className="max-w-xs"
                            onSubmit={save}
                            action=""
                        >

                            <FormGroup
                                label="Email"
                                labelInfo="(required)"
                            >
                                <InputGroup
                                    name="email"
                                    required={true}
                                    type="email"
                                    disabled={loading}
                                />
                            </FormGroup>

                            <FormGroup
                                label="Password"
                                labelInfo="(required)"
                                helperText="If user already exists in another tenant, enter any password, and this will be ignored."
                            >
                                <InputGroup
                                    name="password"
                                    required={true}
                                    type="password"
                                    disabled={loading}
                                />
                            </FormGroup>
                        </form>
                    }
                </div>
            </div>
        </div>
    )
}

export default withAdminUser(withTenant(NewUser, true))
