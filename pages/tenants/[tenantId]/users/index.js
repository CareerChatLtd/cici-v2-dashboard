import {AnchorButton, Button, FocusStyleManager, Icon, Spinner} from '@blueprintjs/core'
import Header from "@/components/Header";
import {useEffect, useState} from "react";
import Head from "next/head";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import {useRouter} from "next/router";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser, withTenant} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const ListUsers = ({tenant}) => {
    const [users, setUsers] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const router = useRouter()

    useEffect(() => {
        // Fetch our list of users
        makeApiRequestForTenant(tenant.id, 'users').then(data => {
            setUsers(data)
        })
    }, [])

    // Scroll to top of page to show any success or error messages
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [successMessage, errorMessages])

    const loading = false

    const confirmDelete = (user) => {
        const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);
        if (confirmed) {
            fetch(`/api/delete-user?id=${user.user_id}&tenantId=${tenant.id}`)
                .then((r) => r.json())
                .then(({error, message}) => {
                    setErrorMessages(error ? [error] : [])
                    setSuccessMessage(error ? '' : message)
                    if (!error) {
                        setUsers(users.filter(u => u.user_id !== user.user_id))
                    }
                })
        }
    }


    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Users - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    backLink={`/tenants/${tenant.id}`}
                    title={`Users for ${tenant.name}`}
                    rightSlot={
                        <AnchorButton
                            type="submit"
                            intent="primary"
                            text="Add User"
                            icon="cube-add"
                            className="mt-4"
                            onClick={() => router.push(`/tenants/${tenant.id}/users/new`)}
                        />
                    }
                />

                {loading ? <Spinner/>
                    :
                    <div>
                        <ErrorBlock errorMessages={errorMessages}/>
                        <SuccessBlock successMessage={successMessage}/>

                        {!users.length && <p>No users currently set up</p>}

                        <ul>
                            {users.map(u => (
                                <li
                                    key={u.email}
                                    className="my-2"><Icon
                                    icon="user"
                                    className="mx-2"
                                />{u.name} <Button
                                    intent="danger"
                                    icon="delete"
                                    title="Delete user"
                                    size={'small'}
                                    className="mx-4"
                                    variant={'minimal'}
                                    onClick={() => confirmDelete(u)}
                                /></li>
                            ))}
                        </ul>


                    </div>
                }

            </div>
        </div>
    )
}

export default withAdminUser(withTenant(ListUsers, true))
