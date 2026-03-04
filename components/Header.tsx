import Image from "next/image";
import logo from "../public/cici-logo.png";
import {Alert, Button, Icon, Menu, MenuDivider, MenuItem, Popover} from "@blueprintjs/core";
import {ReactNode, useState} from "react";
import {isMultiTenantUser, isUserAdmin} from "@/lib/auth0";
import {useRouter} from "next/router";
import {useUser} from "@auth0/nextjs-auth0/client";
import {getBotUrl} from "@/lib/botUrls";
import {Tenant} from "@/lib/types";

interface HeaderProps {
    children?: ReactNode;
    tenant?: Partial<Tenant> | null;
}

export default function Header({children = null, tenant = null}: HeaderProps) {
    const {user} = useUser()
    const [alertMessage, setAlertMessage] = useState<string | null>(null)
    const router = useRouter()

    const resetPassword = (): void => {
        fetch('/api/auth/change-password').then(() => {
            setAlertMessage('A password reset email has been sent to you')
        }).catch(() => {
            setAlertMessage('An error occurred when sending you a password reset email')
        })
    }

    return (
        <header>
            <div
                style={{
                    backgroundColor: '#007A7A',
                    boxShadow: '0px 3px 6px 0px rgba(0, 0, 0, 0.2)',
                    height: '50px',
                    zIndex: 10,
                }}>
                <div className="mx-auto max-w-6xl px-4 flex justify-between items-center overflow-hidden">
                    <a
                        onClick={() => router.push('/')}
                        className="flex items-center hover:no-underline"
                        style={{height: '50px'}}
                        title="Dashboard home page"
                    >
                        <Image
                            src={logo}
                            alt="CiCi"
                            width={66}
                            quality={100}
                            style={{
                                maxWidth: "100%",
                                height: "auto"
                            }}/>
                        <span className="text-xl leading-none pl-2 hidden sm:block"
                              style={{color: '#004b4c'}}>Dashboard</span>
                    </a>

                    {user &&
                        <div className="flex-grow-0 pl-2">
                            <Alert
                                isOpen={!!alertMessage}
                                onClose={() => setAlertMessage(null)}
                            >
                                <p>{alertMessage}</p>
                            </Alert>
                            <Popover
                                usePortal={true}
                                content={
                                    <Menu key="menu" id="user-menu">
                                        <MenuDivider title="Account"/>
                                        <MenuItem icon="key" text="Change password" onClick={resetPassword}/>
                                        <MenuItem icon="log-out" text="Logout" href="/api/auth/logout"/>
                                    </Menu>
                                }
                            >
                                <Button variant="minimal" style={{color: '#004b4c'}}>
                                    <Icon icon="user"
                                          className="!mx-1"
                                          style={{color: '#ffffff'}}/><span
                                    className="hidden sm:inline"
                                    style={{color: '#ffffff'}}>{user.nickname}</span>
                                    <Icon icon="caret-down"
                                          style={{color: '#ffffff'}}/></Button>
                            </Popover>
                            <Popover
                                usePortal={true}
                                content={
                                    <Menu key="menu" id="main-menu">
                                        <MenuItem
                                            icon="home"
                                            text="Dashboard Home"
                                            onClick={() => router.push('/')}
                                        />
                                        <MenuItem
                                            icon="shield"
                                            text="Safeguarding Responses"
                                            onClick={() => router.push(`/high-risk-safeguarding-responses`)}
                                        />

                                        {(isUserAdmin(user) || isMultiTenantUser(user)) && (
                                            <MenuItem
                                                icon="swap-horizontal"
                                                text="Switch tenant"
                                                onClick={() => router.push(`/tenants/switch`)}
                                            />
                                        )}

                                        {isUserAdmin(user) && (
                                            <>
                                                <MenuItem
                                                    icon="cog"
                                                    text="Manage"
                                                    onClick={() => router.push(`/manage`)}
                                                />
                                                <MenuItem
                                                    icon="chart"
                                                    text="Admin Reports"
                                                    onClick={() => router.push(`/admin-reports`)}
                                                />
                                                <MenuItem
                                                    icon="comment"
                                                    text="Feedback"
                                                    onClick={() => router.push(`/feedback`)}
                                                />
                                            </>
                                        )}
                                    </Menu>
                                }
                            >
                                <Button variant="minimal" style={{color: '#ffffff'}}>
                                    <Icon icon="menu"
                                          className="!mx-1"
                                          style={{color: '#ffffff'}}/></Button>
                            </Popover>
                        </div>
                    }
                </div>
            </div>
            <div
                style={{
                    borderBottom: 'solid 2px #f7ba0c',
                    backgroundColor: '#004b4c',
                    height: '50px',
                    zIndex: 10,
                }}>
                <div className="mx-auto max-w-6xl h-full pl-1 pr-2 flex justify-between items-center overflow-hidden">
                    {tenant && tenant.id ?
                        <div className='flex items-center gap-x-1'>
                            <div className="shrink truncate ml-2">
                                <a
                                    className="h-8 px-2 text-xs text-white hover:text-white flex items-center hover:bg-white/10"
                                    href={getBotUrl(tenant.slug)}
                                    target="_blank"
                                    title="Open chat bot"
                                >
                                    <span className="truncate">{tenant.name}</span>
                                    <Icon icon="share" size={12} className="!text-white !mx-1"/>
                                </a>
                            </div>
                            {(isUserAdmin(user) || isMultiTenantUser(user)) &&
                                <div className='flex flex-row gap-x-1 items-center'>
                                    {isUserAdmin(user) && (
                                        <>
                                            <button title='Edit settings'
                                                    className='w-8 h-8 flex justify-center items-center hover:bg-white/10 cursor-pointer'
                                                    type="button" onClick={() => router.push(`/tenants/${tenant.id}`)}>
                                                <Icon icon="wrench" color={'white'} size={12}/>
                                            </button>
                                            <div className="border-l border-white opacity-50 h-5"/>
                                        </>
                                    )}
                                    <button title='Switch tenant'
                                            className='w-8 h-8 flex justify-center items-center hover:bg-white/10 cursor-pointer'
                                            type="button" onClick={() => router.push(`/tenants/switch`)}>
                                        <Icon icon="swap-horizontal" color={'white'} size={12}/>
                                    </button>
                                </div>
                            }
                        </div>
                        : null
                    }

                    <div className="grow">{children}</div>
                </div>
            </div>
        </header>
    );
}
