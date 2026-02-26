import {Icon, Spinner} from "@blueprintjs/core";
import {useEffect, useState} from "react";
import {COLOURS} from "@/lib/colours";
import {DateRange} from "@/lib/dateUtils";

interface Props {
    dateRange: DateRange;
}

const Loading = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-500"><Spinner/></div>
const NoData = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-400">No data for this period</div>

export const AdminUniqueUsersPanel = ({dateRange}: Props) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setData(null);

        if (!dateRange[0] || !dateRange[1]) {
            return;
        }

        // Make API request for all tenants
        const params = new URLSearchParams({
            start: dateRange[0].toISOString().substring(0, 10),
            end: dateRange[1].toISOString().substring(0, 10),
        });

        fetch(`/api/unique-users-all-tenants?${params}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

    }, [dateRange]);

    const noData = !data || (data.totalUsers === 0);

    return (
        <div className="bg-white p-3 h-full">
            <div className="flex flex-row justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-600">Unique Users (All Tenants)</h3>
            </div>
            <div>
                {loading ? <Loading/>
                    : noData ? <NoData/>
                        : <p style={{lineHeight: '1.8em'}}>
                            There were <span style={{color: COLOURS[2]}}>{data.totalUsers} unique users</span> in this period (<span style={{color: COLOURS[6]}}>{data.newUsers} new</span> and <span style={{color: COLOURS[0]}}>{data.existingUsers} existing</span>)
                        </p>
                }
            </div>
        </div>
    );
}
