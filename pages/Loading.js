import Head from "next/head";
import {Spinner} from "@blueprintjs/core";

export default function Loading() {
    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Loading...</title>
            </Head>

            <div className="h-full flex items-center justify-center"><Spinner/></div>
        </div>
    )
}