import {Bar, BarChart, Cell, ResponsiveContainer, XAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";
import {useReportContext} from "@/components/ReportContextProvider";

export const TimeOfDayPanel = () => {

    const asCsv = (data) => ({
        columns: [
            ['hour', 'Hour'],
            ['percent', 'Relative Usage %'],
        ], data
    });

    const noData = (data) => data.length === 0;

    const {filterCount} = useReportContext();

    const render = (data) =>
        <div>
            <p className="text-gray-400 text-xs">Shows relative usage levels across all times of the day.</p>
            <ResponsiveContainer aspect={2}>
                <BarChart data={data}>
                    <XAxis dataKey="hour" tick={{fontSize: '10px'}}/>
                    <Bar dataKey="percent" fill={COLOURS[7]}>
                        {data.map(({hour}) => (
                            <Cell key={hour}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {filterCount > 0 &&
                <p className="text-gray-400 text-xs">⚠️ Date range & filters do not apply to this report</p>}
        </div>

    return <Panel
        title="Time of Day"
        endpoint='time-of-day'
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}