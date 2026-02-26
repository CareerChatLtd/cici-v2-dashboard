import {Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

export const TopicPanel = () => {

    const asCsv = (data) => ({
        columns: [
            ['name', 'Topic'],
            ['count', 'Interactions'],
        ], data
    });

    const noData = (data) => data.reduce((acc, {count}) => acc + count, 0) === 0;

    const render = (data) =>
        <div>
            <ResponsiveContainer height={400}>
                <BarChart data={data} layout="vertical">
                    <YAxis dataKey="name" tick={{fontSize: '10px'}} type="category" width={140} interval={0}/>
                    <XAxis dataKey="count" tick={{fontSize: '10px'}} type="number" allowDecimals={false}/>
                    <Tooltip/>
                    <Bar dataKey="count" fill={COLOURS[1]} layout="vertical">
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLOURS[i % COLOURS.length]}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>

    return <Panel
        title="Topics"
        endpoint='topic-counts'
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
        onlyFilteredByDate={true}
    />
}