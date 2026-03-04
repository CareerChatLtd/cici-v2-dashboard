import Header from "@/components/Header";
import ScreenHeader from "@/components/ScreenHeader";
import Head from "next/head";
import {Icon} from "@blueprintjs/core";
import {useRouter} from "next/router";
import {withAdminUser} from "@/lib/auth";

const entities = [
    {icon: "comparison" as const, name: "Tenants", href: "/tenants", description: "Manage tenant accounts, settings, and users"},
    {icon: "learning" as const, name: "Course data", href: "/course-data", description: "Update course data"},
    {icon: "manual" as const, name: "Knowledge items", href: "/knowledge-items", description: "Increase CiCi's knowledge"},
    {icon: "media" as const, name: "Image items", href: "/image-items", description: "Add images to appear in CiCi conversations"},
]

const ManagePage = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Manage - CiCi Dashboard</title>
            </Head>
            <Header/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <ScreenHeader backLink="/" title="Manage"/>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {entities.map(entity => (
                        <a
                            key={entity.href}
                            onClick={() => router.push(entity.href)}
                            className="flex items-center gap-4 p-4 bg-white rounded shadow hover:shadow-md cursor-pointer hover:no-underline"
                        >
                            <Icon icon={entity.icon} size={24} className="text-gray-600"/>
                            <div>
                                <div className="font-semibold text-gray-900">{entity.name}</div>
                                <div className="text-sm text-gray-500">{entity.description}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default withAdminUser(ManagePage)
