import {Panel} from "../Panel";

export const RegionPanel = () => {

    const asCsv = (data) => ({
        columns: [
            ['name', 'Region'],
            ['count', 'Count'],
            ['percent', 'Percent'],
        ], data
    });

    const noData = (data) => data.reduce((acc, {count}) => acc + count, 0) === 0;

    const render = (data) => <ol className="list-decimal ml-5">
        {data.slice(0, 5).map(x => (
            <li key={x.name} className="text-sm mb-1">{x.name} <span
                className="text-gray-400 text-xs italic">({x.percent}%)</span></li>
        ))}
    </ol>

    return <Panel
        title="Top Regions"
        endpoint='region'
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}