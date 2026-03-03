import {useRouter} from 'next/router'
import {AnchorButton, Button, FocusStyleManager, Icon, InputGroup, Spinner, Switch} from '@blueprintjs/core'
import Header from "@/components/Header";
import {useEffect, useState} from "react";
import Head from "next/head";
import {debounce} from "@/lib/debounce";
import {ErrorBlock} from "@/lib/cms/error-block";
import ScreenHeader from "@/components/ScreenHeader";
import {getBotUrl} from "@/lib/shortLinks";
import {withAdminUser} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const ListTenants = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tenants, setTenants] = useState([])
    const [q, setQ] = useState('')
    const [errorMessages, setErrorMessages] = useState([])

    const handleQueryChange = (event) => {
        const updateFilter = debounce(() => {
            setQ(event.target.value.trim().toLowerCase())
        }, 700)
        updateFilter()
    };

    const handleStatusChange = (event, tenant) => {
        const active = event.target.checked;
        const previousStatus = tenant.status
        tenant.status = active ? 'active' : 'inactive'
        setTenants([...tenants])

        fetch(`/api/update-tenant?tenantId=${tenant.id}`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({status: tenant.status}),
        })
            .then(res => res.json())
            .then(({errors = []}) => {
                setErrorMessages(errors)
                if (errors.length) {
                    tenant.status = previousStatus;
                    setTenants([...tenants])
                }
            })
            .catch(error => {
                setErrorMessages([error.message])
                tenant.status = previousStatus
                setTenants([...tenants])
            });
    }

    const filterTenant = tenant => tenant.name.toLowerCase().includes(q)

    useEffect(() => {
        fetch(`/api/tenants`)
            .then((res) => res.json())
            .then(({data, error}) => {
                if (!error) {
                    setTenants(data ?? [])
                } else {
                    setErrorMessages([error])
                }
                setLoading(false)
            })
    }, [])

    // Focus on main input on load
    useEffect(() => {
        if (loading === false) {
            setTimeout(() => {
                (document
                    .querySelector('#search-panel input') as HTMLInputElement)
                    .focus()
            }, 200)
        }
    }, [loading])

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Manage tenants - CiCi Dashboard</title>
            </Head>
            <Header/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    backLink="/"
                    title="Manage tenants"
                    rightSlot={<AnchorButton
                        type="submit"
                        intent="primary"
                        text="Add Tenant"
                        icon="cube-add"
                        onClick={() => router.push(`/tenants/new`)}
                    />}
                />

                {loading ? <Spinner/>
                    :
                    <div>
                        <ErrorBlock errorMessages={errorMessages}/>

                        <div id="search-panel" className="max-w-xs">
                            <InputGroup
                                type="search"
                                leftIcon="filter"
                                onChange={handleQueryChange}
                            />
                        </div>

                        <table className="mt-4">
                            <thead>
                            <tr className="border-b border-gray-300 bg-gray-300">
                                <th className="px-4 py-1 text-left">Tenant</th>
                                <th className="px-4 py-1 text-center">Status</th>
                                <th className="px-4 py-1">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tenants.filter(filterTenant).map(tenant => (
                                <tr key={tenant.id} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-4 py-1">{tenant.name}</td>
                                    <td className="px-4 py-1 text-center">
                                        <Switch
                                            className="m-0"
                                            checked={tenant.status === 'active'}
                                            innerLabel="Off"
                                            innerLabelChecked="On"
                                            onChange={(e) => handleStatusChange(e, tenant)}
                                        />
                                    </td>
                                    <td className="px-4 py-1 flex gap-x-2">
                                        <Button size="small"
                                                icon="wrench"
                                                text="Settings"
                                                onClick={() => router.push(`/tenants/${tenant.slug}`)}
                                        />
                                        <Button size="small"
                                                icon="people"
                                                text="Users"
                                                onClick={() => router.push(`/tenants/${tenant.slug}/users`)}
                                        />
                                        <a
                                            className="ml-4 text-xs flex items-center default-link"
                                            href={getBotUrl(tenant.slug)}
                                            target="_blank"
                                            title="Open chat bot"
                                        >
                                            <span>Open bot</span>
                                            <Icon icon="share" size={12} className="!ml-2"/>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
}

export default withAdminUser(ListTenants)
