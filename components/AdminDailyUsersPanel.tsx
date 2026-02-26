import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {COLOURS} from "@/lib/colours";
import {DateRange} from "@/lib/dateUtils";
import {Spinner} from "@blueprintjs/core";
import {useEffect, useState} from "react";

interface Props {
    dateRange: DateRange;
}

const Loading = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-500"><Spinner/></div>
const NoData = () => <div className="h-full min-h-[120px] flex items-center justify-center text-gray-400">No data for this period</div>
const DateRangeTooBig = () => <p className="text-gray-400 text-xs">⚠️ Choose a period of 31 days or less to view data</p>

export const AdminDailyUsersPanel = ({dateRange}: Props) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [start, end] = dateRange
    const dateRangeInDays = start && end ? Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const dateRangeTooBig = dateRangeInDays > 31;

    useEffect(() => {
        setLoading(true);
        setData(null);

        if (!dateRange[0] || !dateRange[1] || dateRangeTooBig) {
            setLoading(false);
            return;
        }

        // Make API request for all tenants
        const params = new URLSearchParams({
            start: dateRange[0].toISOString().substring(0, 10),
            end: dateRange[1].toISOString().substring(0, 10),
        });

        fetch(`/api/daily-users-all-tenants?${params}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

    }, [dateRange, dateRangeTooBig]);

    const noData = !data || data.length === 0;

    return (
        <div className="bg-white p-3 h-full">
            <div className="flex flex-row justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-600">Unique Daily Users (All Tenants)</h3>
            </div>
            <div>
                {loading ? <Loading/>
                    : dateRangeTooBig ? <DateRangeTooBig/>
                        : noData ? <NoData/>
                            : <ResponsiveContainer aspect={1.6}>
                                <LineChart
                                    data={data}
                                    width={300}
                                    height={100}
                                >
                                    <Tooltip labelFormatter={(x => (new Date(x)).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }))}/>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(x) => {
                                            const dateString = (x && x !== 'auto') ? x : (dateRange[0].toISOString().split('T')[0])
                                            const [_, month, day] = dateString.split('-')
                                            return `${day}/${month}`
                                        }}
                                    />
                                    <YAxis
                                        dataKey="totalUsers"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="existingUsers"
                                        stroke={COLOURS[0]}
                                        strokeWidth={2}
                                        name={`Existing users`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="newUsers"
                                        stroke={COLOURS[6]}
                                        strokeWidth={2}
                                        name={`New users`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="totalUsers"
                                        stroke={COLOURS[2]}
                                        strokeWidth={2}
                                        name={`Total`}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                }
            </div>
        </div>
    );
}
