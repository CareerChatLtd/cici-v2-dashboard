import {Cell, Legend, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";
import {
    applyFriendlyNames,
    BuiltInQuestionReportData,
    getBuiltInQuestionEndpoint,
    hasNoData
} from "@/lib/builtInQuestionReports";

const names = {
    NONE: 'None',
    GCSE: 'GCSE',
    A_LEVEL: 'A Level',
    DEGREE: 'Degree',
    MASTERS: 'Masters',
    PHD: 'PhD',
}

export const HighestQualificationPanel = () => {

    const asCsv = (data: BuiltInQuestionReportData) => ({
        columns: [
            ['name', 'Qualification'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ],
        data: applyFriendlyNames(data, names)
    });

    const render = (data: BuiltInQuestionReportData) => <ResponsiveContainer aspect={1}>
        <PieChart>
            <Pie
                data={applyFriendlyNames(data, names)}
                dataKey="percent"
                label={({percent}) => `${percent.toFixed(0)}%`}
            >
                {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLOURS[index % COLOURS.length]}/>
                ))}
            </Pie>
            <Legend verticalAlign="bottom"
                    wrapperStyle={{fontSize: "11px", lineHeight: 1.8}}
                    iconType="circle"
            />
        </PieChart>
    </ResponsiveContainer>

    return <Panel
        title="Highest Qualification"
        endpoint={getBuiltInQuestionEndpoint('highestQualification')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}