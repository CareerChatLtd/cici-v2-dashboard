import {Panel} from "../Panel";

export const TextPanel = ({title, questionId}) => {

    const asCsv = (data) => ({
        columns: [
            ['respondedAt', 'Date'],
            ['responseText', 'Response'],
        ],
        data: data.map(({responseText, respondedAt}) => ({
            responseText,
            respondedAt: respondedAt.substring(0, 10)
        }))
    });

    const noData = (data) => data.length === 0;

    const render = (data) =>
        <div>
            <table className="mt-4 w-full">
                <thead>
                <tr className="border-b border-gray-300 bg-gray-300">
                    <th className="px-4 py-1 text-left">Response</th>
                </tr>
                </thead>
                <tbody>
                {data.slice(0, 5).map(response => (
                    <tr key={response.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="px-4 py-1 text-left">{response.responseText}</td>
                    </tr>))}
                </tbody>
            </table>
            <p className='text-xs mt-5 text-gray-500 italic'>Showing <strong>{data.slice(0, 5).length}</strong> of <strong>{data.length}</strong> responses
            </p>
        </div>

    return <Panel
        title={title}
        endpoint={`question-responses?questionId=${questionId}`}
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}