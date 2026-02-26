import {Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

export const AgePanel = () => {

    const noData = (data) => data.reduce((acc, {count}) => acc + count, 0) === 0

    const asCsv = (data) => ({
        columns: [
            ['name', 'Age'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ], data
    });

    const render = (data) => <ResponsiveContainer aspect={2}>
        <BarChart data={data}>
            <XAxis dataKey="name" tick={{fontSize: '10px'}}/>
            <YAxis dataKey="percent" tick={{fontSize: '10px'}} allowDecimals={false}
                   tickFormatter={(x => `${x}%`)}/>
            <Tooltip formatter={(x => [`${x}%`, null])} labelFormatter={(x => `Age ${x}`)}/>
            <Bar dataKey="percent">
                {data.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#eeeeee' : COLOURS[i % COLOURS.length]}/>
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>

    return <Panel
        title="Age"
        endpoint="age"
        asCsv={asCsv}
        hasNoData={noData}
        render={render}
    />
}
