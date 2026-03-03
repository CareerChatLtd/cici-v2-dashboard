import {isMultiTenantUser, isUserAdmin} from './auth0';
import {FC, useEffect, useState} from "react";
import {UserProfile, useUser, withPageAuthRequired} from "@auth0/nextjs-auth0/client";
import Custom403 from "../pages/403";
import {useRouter} from "next/router";
import Custom500 from "../pages/500";
import Custom401 from "../pages/401";
import Loading from "../pages/Loading";

/**
 * Wrap a Next.js page to ensure that the user is an admin user.
 */
export const withAdminUser = (Component: FC<{ user: UserProfile }>) => withPageAuthRequired(() => {
    const {user, isLoading, error} = useUser()

    if (isLoading) {
        return <Loading/>
    }

    if (error) {
        return <Custom401 message={error.message}/>
    }

    if (!isUserAdmin(user)) {
        return <Custom403/>
    }
    return <Component user={user}/>
})

/**
 * Wrap a Next.js page to ensure that the user has access to multiple tenants or is an admin.
 */
export const withMultiTenantUser = (Component: FC<{ user: UserProfile }>) => withPageAuthRequired(() => {
    const {user, isLoading, error} = useUser()

    if (isLoading) {
        return <Loading/>
    }

    if (error) {
        return <Custom401 message={error.message}/>
    }

    if (!isUserAdmin(user) && !isMultiTenantUser(user)) {
        return <Custom403/>
    }
    return <Component user={user}/>
})

/**
 * Wrap a Next.js page to ensure that the current user has access to at least one tenant.
 */
export const withTenant = (Component, fromUrl = false) => withPageAuthRequired(() => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tenant, setTenant] = useState()
    const router = useRouter()
    const {isLoading: userIsLoading, error: userError} = useUser()

    useEffect(() => {
        if (typeof window !== 'undefined' && router.isReady) {
            const tenantId = fromUrl ? router.query.tenantId : localStorage.getItem('tenantId') ?? ''
            fetch(`/api/tenant?tenantId=${tenantId}`)
                .then((res) => {
                    if (res.status === 403 && !fromUrl) {
                        // Access denied - try fallback to default tenant
                        return fetch('/api/tenant')
                    }
                    return res
                })
                .then((res) => res.json())
                .then(({error, data}) => {
                    if (!error) {
                        setTenant(data)
                        // Always sync localStorage with slug for tenant resolution
                        localStorage.setItem('tenantId', data.id)
                    } else {
                        if (!fromUrl) {
                            localStorage.removeItem('tenantId')
                        }
                    }
                    setIsLoading(false)
                })
                .catch((error) => {
                    console.error('Error fetching tenant', error)
                    setError('Error fetching tenant')
                    setIsLoading(false)
                })
        }
    }, [router.isReady])

    if (isLoading || userIsLoading) {
        return <Loading/>
    }

    if (userError) {
        return <Custom401 message={userError.message}/>
    }

    if (error) {
        return <Custom500/>
    }

    if (!tenant) {
        return <Custom403/>
    }


    return <Component tenant={tenant}/>
})
