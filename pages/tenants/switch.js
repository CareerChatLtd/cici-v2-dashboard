import {useRouter} from 'next/router'
import {FocusStyleManager, Icon, MenuItem, Spinner} from '@blueprintjs/core'
import Header from "@/components/Header";
import {Suggest} from "@blueprintjs/select";
import {useEffect, useState} from "react";
import Head from "next/head";
import {withMultiTenantUser} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const SwitchTenant = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tenants, setTenants] = useState([])
    const [errorMessage, setErrorMessage] = useState('')

    const switchTenant = tenantId => {
        localStorage.setItem('tenantId', tenantId);
        router.push(`/`)
    }

    const filterTenant = (query, tenant, _index, exactMatch) => {
        const normalizedTitle = tenant.name.toLowerCase();
        const normalizedQuery = query.toLowerCase();

        return normalizedTitle.includes(normalizedQuery);
    };

    useEffect(() => {
        fetch(`/api/tenants`)
            .then((res) => res.json())
            .then(({data, error}) => {
                if (!error) {
                    setTenants(data ?? []);
                } else {
                    setErrorMessage(error)
                }
                setLoading(false)
            })
    }, [])

    // Focus on main input on load
    useEffect(() => {
        if (loading === false) {
            setTimeout(() => {
                document
                    .querySelector('#search-panel input')
                    .focus()
            }, 200)
        }
    }, [loading])

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Switch Tenants - CiCi Dashboard</title>
            </Head>
            <Header />

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <h1 className="text-lg mb-3">Available Tenants</h1>
                <div id="search-panel" className="max-w-xs">
                    {loading ? <Spinner/>
                        :
                        errorMessage.length
                            ?
                            <p style={{color: 'red', fontWeight: 'bold'}}><Icon icon="warning-sign" style={{
                                color: 'red',
                                margin: '0 8px 0 0'
                            }}/> {errorMessage}</p>
                            :
                            <Suggest
                                inputValueRenderer={(tenant) => tenant.name}
                                items={tenants}
                                itemPredicate={filterTenant}
                                itemRenderer={(t, {modifiers, handleClick, ref}) => {
                                    if (!modifiers.matchesPredicate) {
                                        return null;
                                    }
                                    return <MenuItem
                                        text={t.name}
                                        key={t.id}
                                        onClick={handleClick}
                                        active={modifiers.active}
                                    />
                                }}
                                onItemSelect={(tenant) => {
                                    switchTenant(tenant.id)
                                }}
                            />
                    }
                </div>
            </div>
        </div>
    );
}

export default withMultiTenantUser(SwitchTenant)
