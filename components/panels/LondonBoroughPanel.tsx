import {Panel} from "../Panel";
import {
    applyFriendlyNames,
    BuiltInQuestionReportData,
    getBuiltInQuestionEndpoint,
    hasNoData
} from "@/lib/builtInQuestionReports";

export const LondonBoroughPanel = () => {

    const asCsv = (data: BuiltInQuestionReportData) => ({
        columns: [
            ['name', 'Borough'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ],
        data: applyFriendlyNames(data)
    });

    const render = (data: BuiltInQuestionReportData) => <ol className="list-decimal ml-5">
        {applyFriendlyNames(data).slice(0, 5).map(x => (
            <li key={x.name} className="text-sm mb-1">{x.name} <span
                className="text-gray-400 text-xs italic">{x.count} ({x.percent}%)</span></li>
        ))}
    </ol>

    return <Panel
        title="London Boroughs"
        endpoint={getBuiltInQuestionEndpoint('londonBorough')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}