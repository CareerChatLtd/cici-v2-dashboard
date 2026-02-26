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
    yes: 'Yes',
    no: 'No',
}

export const IsEnrolledPanel = () => {

    const asCsv = (data: BuiltInQuestionReportData) => ({
        columns: [
            ['name', 'Response'],
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
                label={false}
            >
                {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLOURS[index % COLOURS.length]}/>
                ))}
            </Pie>
            <Legend verticalAlign="bottom"
                    wrapperStyle={{fontSize: "11px", lineHeight: 1.8}}
                    iconType="circle"
                    formatter={(value, entry) =>
                        // @ts-expect-error - Legend formatter doesn't appear to pass on the shape of our data
                        `${value} (${entry.payload.percent ?? 0}%)`}
            />
        </PieChart>
    </ResponsiveContainer>

    return <Panel
        title="Enrolled?"
        endpoint={getBuiltInQuestionEndpoint('isEnrolled')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}