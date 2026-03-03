import Head from "next/head";
import Header from "@/components/Header";

export default function Custom404() {
    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>404 - Page not found</title>
            </Head>
            <Header tenant={{}}/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <h1 className="text-lg mb-3 text-red-900">404 - Page not found</h1>
                <p>Please return to the <a href={'/'} className='underline underline-offset-4'>dashboard homepage</a></p>
            </div>
        </div>
    )
}
