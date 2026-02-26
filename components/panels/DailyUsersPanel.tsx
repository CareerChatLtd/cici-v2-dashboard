import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";
import {useReportContext} from "@/components/ReportContextProvider";

export const DailyUsersPanel = () => {

    const {dateRange} = useReportContext();

    const maxDateRangeInDays = 31

    const asCsv = (data) => ({
        columns: [
            ['date', 'Date'],
            ['newUsers', 'New Users'],
            ['existingUsers', 'Existing Users'],
            ['totalUsers', 'Total Users'],
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
                            dataKey="totalUsers"
                        />

                        <Line
                            type="monotone"
                            dataKey="existingUsers"
                            stroke={COLOURS[0]}
                            strokeWidth={2}
                            name={`Existing users`}
                        />
                        <Line
                            type="monotone"
                            dataKey="newUsers"
                            stroke={COLOURS[6]}
                            strokeWidth={2}
                            name={`New users`}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalUsers"
                            stroke={COLOURS[2]}
                            strokeWidth={2}
                            name={`Total`}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }

    return <Panel hasNoData={() => false} title="Unique Daily Users" endpoint='daily-users' render={render}
                  asCsv={asCsv}
                  maxDateRangeInDays={maxDateRangeInDays}/>
}
