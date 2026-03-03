import Header from "@/components/Header";
import {useUser} from "@auth0/nextjs-auth0/client";
import {useRouter} from "next/router";
import {AnchorButton} from '@blueprintjs/core'
import Head from "next/head";

export default function Login() {
    const {user} = useUser()
    const router = useRouter()

    if (user) {
        router.push(`/`)
        return <div/>
    }

    return (
        <div className="flex flex-col h-screen">
            <Head>
                <title>Login - CiCi Dashboard</title>
            </Head>
            <Header tenant={{}}/>
            <div className="flex-auto pb-10" style={{backgroundColor: '#E8E6E5'}}>
                <div className="mx-auto max-w-6xl px-8 h-full">
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white shadow p-8 text-center flex items-center"
                             style={{width: '300px', height: '200px'}}>
                            <div className="text-center w-full">
                                <AnchorButton size="large" href="/api/auth/login">Login</AnchorButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
