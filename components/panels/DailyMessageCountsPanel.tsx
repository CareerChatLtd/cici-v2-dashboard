import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";
import {useReportContext} from "@/components/ReportContextProvider";

export const DailyMessageCountsPanel = () => {

    const {dateRange} = useReportContext();

    const maxDateRangeInDays = 31

    const asCsv = (data) => ({
        columns: [
            ['date', 'Date'],
            ['totalMessages', 'Total Messages'],
        ], data
    });

    const render = (data) => {
        return (
            <div>
                <ResponsiveContainer aspect={1.6}>
                    <LineChart
                        data={data}
                        width={300}
                        height={100}
                    >
                        <Tooltip labelFormatter={(x => (new Date(x)).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }))}/>
                        <XAxis
                            dataKey="date"
                            tickFormatter={(x) => {
                                const dateString = (x && x !== 'auto') ? x : (dateRange[0].toISOString().split('T')[0])
                                const [_, month, day] = dateString.split('-')
                                return `${day}/${month}`
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
            </div>
        )
    }

    return <Panel hasNoData={() => false} title="Messages sent by users" endpoint='daily-message-counts' render={render}
                  asCsv={asCsv}
                  maxDateRangeInDays={maxDateRangeInDays}/>
}
