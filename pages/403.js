import Head from "next/head";
import Header from "@/components/Header";

export default function Custom403() {
    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>403 - Unauthorised</title>
            </Head>
            <Header tenant={{}}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <h1 className="text-lg mb-4 text-red-900">403 - Unauthorised</h1>
                <p>You do not have permission to access this page.</p>
                <p className='mt-2'>You may wish to try logging out, and then back in again.</p>
            </div>
        </div>
    )
}