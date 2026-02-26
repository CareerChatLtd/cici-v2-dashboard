import {Panel} from "../Panel";
import {
    applyFriendlyNames,
    BuiltInQuestionReportData,
    getBuiltInQuestionEndpoint,
    hasNoData
} from "@/lib/builtInQuestionReports";

export const EthnicityPanel = () => {

    const asCsv = (data: BuiltInQuestionReportData) => ({
        columns: [
            ['name', 'Ethnicity'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ],
        data: applyFriendlyNames(data)
    });

    const render = (data: BuiltInQuestionReportData) =>
        <ol className="list-decimal ml-5">
            {applyFriendlyNames(data).slice(0, 7).map(x => (
                <li key={x.name} className="text-sm mb-1">{x.name} <span
                    className="text-gray-400 text-xs italic">({x.percent}%)</span></li>
            ))}
        </ol>

    return <Panel
        title="Ethnicity"
        endpoint={getBuiltInQuestionEndpoint('ethnicity')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}