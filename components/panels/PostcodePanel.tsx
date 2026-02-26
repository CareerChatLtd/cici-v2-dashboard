import {Panel} from "../Panel";
import {
    applyFriendlyNames,
    BuiltInQuestionReportData,
    getBuiltInQuestionEndpoint,
    hasNoData
} from "@/lib/builtInQuestionReports";

export const PostcodePanel = () => {

    const asCsv = (data: BuiltInQuestionReportData) => ({
        columns: [
            ['name', 'Postcode'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ],
        data: applyFriendlyNames(data)
    });

    const render = (data: BuiltInQuestionReportData) => <ol className="list-decimal ml-5">
        {applyFriendlyNames(data).slice(0, 5).map(x => (
            <li key={x.name} className="text-sm mb-1">{x.name} <span
                className="text-gray-400 text-xs italic">({x.percent}%)</span></li>
        ))}
    </ol>

    return <Panel
        title="Postcodes"
        endpoint={getBuiltInQuestionEndpoint('firstPartOfPostcode')}
        render={render}
        asCsv={asCsv}
        hasNoData={hasNoData}
    />
}