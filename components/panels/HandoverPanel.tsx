import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

export const HandoverPanel = () => {

    const asCsv = (data) => ({
        columns: [
            ['date', 'Date'],
            ['count', 'Handovers'],
        ], data
    });

    const noData = (data) => data.reduce((acc, {count}) => acc + count, 0) === 0;

    const render = (data) => <ResponsiveContainer aspect={1.6}>
        <LineChart
            data={data}
            width={300}
            height={100}
        >
            <Tooltip labelFormatter={(x => (new Date(x)).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }))}/>
            <XAxis
                dataKey="date"
                tickFormatter={(x) => {
                    const dateString = (x && x !== 'auto') ? x : (new Date().toISOString().split('T')[0])
                    const [_, month, day] = dateString.split('-')
                    return `${day}/${month}`
                }}
            />
            <YAxis
                dataKey="count"
            />
            <Line
                type="monotone"
                dataKey="count"
                stroke={COLOURS[4]}
                strokeWidth={2}
                name="Number of handovers"
            />
        </LineChart>
    </ResponsiveContainer>

    return <Panel
        title="Handovers"
        endpoint='handovers'
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
        maxDateRangeInDays={31} // Pass the maxDateRangeInDays prop here
        onlyFilteredByDate={true}
    />
}