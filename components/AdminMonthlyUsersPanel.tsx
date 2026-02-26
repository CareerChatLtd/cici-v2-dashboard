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
const DateRangeTooBig = () => <p className="text-gray-400 text-xs">⚠️ Choose a period of 365 days or less to view data</p>

export const AdminMonthlyUsersPanel = ({dateRange}: Props) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [start, end] = dateRange
    const dateRangeInDays = start && end ? Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const dateRangeTooBig = dateRangeInDays > 365;

    useEffect(() => {
        setLoading(true);
        setData(null);

        if (!dateRange[0] || !dateRange[1] || dateRangeTooBig) {
            setLoading(false);
            return;
        }

        // Make API request for all tenants
        const params = new URLSearchParams({
            month: dateRange[0].toISOString().slice(0, 7),
            months: String(Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / 1000 / 60 / 60 / 24 / 31))
        });

        fetch(`/api/monthly-users-all-tenants?${params}`)
            .then(res => res.json())
            .then(({data}) => {
                setData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

    }, [dateRange, dateRangeTooBig]);

    const noData = !data || data.length === 0 || data.reduce((acc, {totalUsers}) => acc + totalUsers, 0) === 0;

    return (
        <div className="bg-white p-3 h-full">
            <div className="flex flex-row justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-600">Unique Monthly Users (All Tenants)</h3>
            </div>
            <div>
                {loading ? <Loading/>
                    : dateRangeTooBig ? <DateRangeTooBig/>
                        : noData ? <NoData/>
                            : <div>
                                <ResponsiveContainer aspect={1.6}>
                                    <LineChart
                                        data={data}
                                        width={300}
                                        height={100}
                                    >
                                        <Tooltip labelFormatter={(x => (new Date(x)).toLocaleString(
                                            'en-GB',
                                            {month: 'long', year: 'numeric'}
                                        ))}/>
                                        <XAxis
                                            dataKey="month"
                                            tickFormatter={(x) => {
                                                const monthString = (x && x !== 'auto') ? x : (dateRange[0].toISOString().slice(0, 7))
                                                const date = new Date(`${monthString}-01`)
                                                return date.toLocaleString(
                                                    'en-GB',
                                                    {month: 'short'}
                                                )
                                            }}
                                        />
                                        <YAxis
                                            dataKey="totalUsers"
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
                                            dataKey="existingUsers"
                                            stroke={COLOURS[0]}
                                            strokeWidth={2}
                                            name={`Existing users`}
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
                                <p className="text-gray-400 text-xs">⚠️ Complete months only!</p>
                            </div>
                }
            </div>
        </div>
    );
}
