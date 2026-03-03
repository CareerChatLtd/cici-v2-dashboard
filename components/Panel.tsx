import {Icon, Spinner} from "@blueprintjs/core";
import {ReactNode, useEffect, useState} from "react";
import {makeApiRequestForDateRange} from "@/lib/apiUtils";
import {generateCsvDownload} from "@/lib/csvExport";
import {useReportContext} from "@/components/ReportContextProvider";

const DownloadLink = ({onClick}: { onClick: () => void }) =>
    <a href="#" className="text-xs text-blue-500 hover:text-inherit default-link flex items-center gap-1 " onClick={(e) => {
        e.preventDefault();
        onClick();
    }}><Icon
        icon='cloud-download' size={12}/>
        <span>Download</span>
    </a>

const Loading = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-500"><Spinner/>
</div>

const NoData = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-400">No data for
    this period</div>

const DateRangeTooBig = ({maxDateRangeInDays}: { maxDateRangeInDays: number }) =>
    <p className="text-gray-400 text-xs">⚠️ Choose a period of {maxDateRangeInDays} days or less to view data </p>

interface PanelProps {
    title: string;
    endpoint: string;
    render: (data) => ReactNode;
    asCsv?: (data) => ({ columns, data });
    hasNoData: (data) => boolean;
    maxDateRangeInDays?: number;
    onlyFilteredByDate?: boolean;
}

export const Panel = ({
                          title,
                          endpoint,
                          render,
                          asCsv,
                          hasNoData,
                          maxDateRangeInDays,
                          onlyFilteredByDate
                      }: PanelProps) => {
    const {tenantId, dateRange, customQuestions, filterCount} = useReportContext();
    const [data, setData] = useState(null)

    const [start, end] = dateRange
    const dateRangeInDays = start && end ? Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const dateRangeTooBig = maxDateRangeInDays && dateRangeInDays > maxDateRangeInDays;
    const loading = !dateRangeTooBig && data === null;
    const dataAvailable = data !== null && !loading && !dateRangeTooBig && !hasNoData(data);

    useEffect(() => {
        setData(null);
        if (dateRangeTooBig || !tenantId || !dateRange[0] || !dateRange[1]) {
            return;
        }

        // endpoint might contain it's own query params, so parse it and pass as an object to makeApiRequestForDateRange
        const [actualEndpoint, query] = endpoint.split('?');
        const queryParams = new URLSearchParams(query);

        const additionalParams = {
            ...Object.fromEntries(queryParams.entries()),
            // @ts-ignore
            questions: Object.fromEntries([...customQuestions.entries()]
                // Make array keys look like object keys to QS library
                // Preserve arrays so multi-select questions can be distinguished from single-select
                // Booleans will get automatically converted to strings by QS
                .map(([k, v]) => [`_${k}`, v])),
        };

        makeApiRequestForDateRange(tenantId, actualEndpoint, dateRange, additionalParams).then(setData)

    }, [customQuestions, tenantId, dateRange, endpoint, dateRangeTooBig])

    const startDownload = () => {
        const {columns, data: csvData} = asCsv(data);
        generateCsvDownload(title, dateRange, columns, csvData);
    }

    return (
        <div className="bg-white p-3 h-full">
            <div className="flex flex-row justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-600">{title}</h3>
                {dataAvailable && asCsv && <DownloadLink onClick={startDownload}/>}
            </div>
            <div>
                {
                    loading ? <Loading/>
                        : dateRangeTooBig ? <DateRangeTooBig maxDateRangeInDays={maxDateRangeInDays}/>
                            : !dataAvailable ? <NoData/>
                                : render(data)
                }
            </div>
            {onlyFilteredByDate && filterCount > 0 && <p className="text-gray-400 text-xs">⚠️ Only filtered by date</p>}
        </div>
    )
}
