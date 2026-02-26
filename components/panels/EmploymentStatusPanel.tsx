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
    EMPLOYED: 'Employed',
    SELF_EMPLOYED: 'Self-Employed',
    UNEMPLOYED: 'Unemployed',
    STUDENT: 'Student',
    SEMI_RETIRED: 'Semi-Retired',
}

export const EmploymentStatusPanel = () => {

    const asCsv = (data) => ({
        columns: [
            ['name', 'Status'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ],
        data: applyFriendlyNames(data, names)
    });

    const render = (rawData: BuiltInQuestionReportData) => {
        const data = applyFriendlyNames(rawData, names)
        return <ResponsiveContainer aspect={1}>
            <PieChart>
                <Pie
                    data={data}
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
        </ResponsiveContainer>;
    }

    return <Panel
        title="Employment Status"
        endpoint={getBuiltInQuestionEndpoint('employmentStatus')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}