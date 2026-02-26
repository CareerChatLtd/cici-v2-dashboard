import {Spinner} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {DateRange} from "@/lib/dateUtils";

interface Props {
    dateRange: DateRange;
}

interface TenantData {
    tenantId: string;
    tenantName: string;
    activeUsers: number;
}

const Loading = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-500"><Spinner/></div>
const NoData = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-400">No data for this period</div>

export const AdminTopTenantsPanel = ({dateRange}: Props) => {
    const [data, setData] = useState<TenantData[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setData(null);

        if (!dateRange[0] || !dateRange[1]) {
            return;
        }

        const params = new URLSearchParams({
            start: dateRange[0].toISOString().substring(0, 10),
            end: dateRange[1].toISOString().substring(0, 10),
        });

        fetch(`/api/admin-top-tenants?${params}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

    }, [dateRange]);

    const noData = !data || data.length === 0;

    return (
        <div className="bg-white p-3 h-full">
            <div className="flex flex-row justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-600">Top Tenants</h3>
            </div>
            <div>
                {loading ? <Loading/>
                    : noData ? <NoData/>
                        : <table className="mt-4 w-full">
                            <thead>
                            <tr className="border-b border-gray-300 bg-gray-300">
                                <th className="px-4 py-1 text-left">Tenant</th>
                                <th className="px-4 py-1 text-right">Active Users</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map(tenant => (
                                <tr key={tenant.tenantId} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-4 py-1 text-left">{tenant.tenantName || tenant.tenantId}</td>
                                    <td className="px-4 py-1 text-right">{tenant.activeUsers}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                }
            </div>
        </div>
    );
}
