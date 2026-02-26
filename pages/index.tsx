import Reports from "@/components/Reports";
import {ReportContextProvider} from "@/components/ReportContextProvider";

export default function Home() {
    return <ReportContextProvider><Reports/></ReportContextProvider>
}
