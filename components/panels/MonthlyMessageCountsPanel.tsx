import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";
import {useReportContext} from "@/components/ReportContextProvider";

export const MonthlyMessageCountsPanel = () => {
    const {tenantId, dateRange} = useReportContext();
    const [start, end] = dateRange;
    const maxDateRangeInDays = 365;

    const asCsv = (data) => ({
        columns: [
            ['month', 'Month'],
            ['totalMessages', 'Total Messages'],
        ], data
    });

    const noData = (data) => data.reduce((acc, {count}) => acc + count, 0) === 0;

    const render = (data) => {
        return (
            <div>
                <ResponsiveContainer aspect={1.6}>
                    <LineChart
                        data={data}
                        width={300}
                        height={100}
                    >
                        <Tooltip labelFormatter={(x => (new Date(x)).toLocaleString(
                            'en-GB',
                            {month: 'long', year: 'numeric'}
                        ))}/>
                        <XAxis
                            dataKey="month"
                            tickFormatter={(x) => {
                                const monthString = (x && x !== 'auto') ? x : (dateRange[0].toISOString().slice(0, 7))
                                const date = new Date(`${monthString}-01`)
                                return date.toLocaleString(
                                    'en-GB',
                                    {month: 'short'}
                                )
                            }}
                        />
                        <YAxis
                            dataKey="totalMessages"
                        />
                        <Line
                            type="monotone"
                            dataKey="totalMessages"
                            stroke={COLOURS[2]}
                            strokeWidth={2}
                            name={`Total`}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <p className="text-gray-400 text-xs">⚠️ Complete months only!</p>
            </div>
        )
    }

    return <Panel
        title="Messages sent by users"
        endpoint={`monthly-message-counts?${new URLSearchParams({
            tenantId: String(tenantId),
            month: start.toISOString().slice(0, 7),
            months: String(Math.ceil((end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24 / 31))
        }).toString()}`}
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
        maxDateRangeInDays={maxDateRangeInDays}
    />
}