import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

interface SafeguardingData {
    highCount: number;
    lowCount: number;
    totalCount: number;
    categories: Array<{
        tier: string;
        name: string;
        count: number;
    }>;
}

export const SafeguardingPanel = () => {

    // Always show the panel, even with zero counts, to reassure users there were no concerns
    const noData = () => {
        return false;
    };

    const asCsv = (data: SafeguardingData) => ({
        columns: [
            ['metric', 'Metric'],
            ['conversations', 'Conversations'],
            ['messages', 'Messages'],
        ],
        data: [
            {
                metric: 'Total',
                conversations: data.totalCount,
                messages: data.categories.reduce((acc, cat) => acc + cat.count, 0),
            },
            {
                metric: 'HIGH risk',
                conversations: data.highCount,
                messages: data.categories.reduce((acc, cat) => cat.tier === 'HIGH' ? acc + cat.count : acc, 0),
            },
            {
                metric: 'LOW risk',
                conversations: data.lowCount,
                messages: data.categories.reduce((acc, cat) => cat.tier === 'LOW' ? acc + cat.count : acc, 0),
            },
            ...data.categories.map(cat => ({
                metric: `${cat.tier}: ${cat.name}`,
                conversations: '',
                messages: cat.count,
            }))
        ]
    });

    const render = (data: SafeguardingData) => (
        <div style={{lineHeight: '1.8em'}}>
            <p className="mb-4">
                <span style={{color: COLOURS[3], fontWeight: 'bold'}}>
                    {data.highCount} HIGH
                </span>
                {' and '}
                <span style={{color: COLOURS[1], fontWeight: 'bold'}}>
                    {data.lowCount} LOW
                </span>
                {' risk conversations detected out of '}
                <span style={{fontWeight: 'bold'}}>
                    {data.totalCount} total
                </span>
            </p>

            {data.categories.length > 0 && (
                <div>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-300 bg-gray-100">
                            <th className="px-2 py-1 text-left text-xs">Tier</th>
                            <th className="px-2 py-1 text-left text-xs">Category</th>
                            <th className="px-2 py-1 text-right text-xs">Messages</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.categories.map((category) => (
                            <tr key={category.name} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-2 py-1 text-left text-xs">{category.tier}</td>
                                <td className="px-2 py-1 text-left text-xs">{category.name}</td>
                                <td className="px-2 py-1 text-right text-xs">{category.count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return <Panel
        title="Safeguarding"
        endpoint='safeguarding-report'
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}
