import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

const summariseData = (data) => {
    // Group the data by the responseBoolean property and calculate the percentage of each
    const total = data.length;
    const yesCount = data.filter(({responseBoolean}) => responseBoolean).length;
    const noCount = total - yesCount;

    return [
        {name: 'Yes', percent: total === 0 ? 0 : (yesCount / total) * 100},
        {name: 'No', percent: total === 0 ? 0 : (noCount / total) * 100},
    ];
}

export const YesNoPanel = ({title, questionId}) => {

    const asCsv = (data) => ({
        columns: [
            ['name', 'Response'],
            ['percent', 'Percent'],
        ], data: summariseData(data)
    });

    const noData = (data) => data.length === 0;

    const render = (rawData) => {
        const data = summariseData(rawData);
        return <ResponsiveContainer aspect={1}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="percent"
                    label={({percent, name}) => `${name} (${percent.toFixed(0)}%)`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLOURS[index % COLOURS.length]}/>
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    }

    return <Panel
        title={title}
        endpoint={`question-responses?questionId=${questionId}`}
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}