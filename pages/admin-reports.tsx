import ScreenHeader from "@/components/ScreenHeader";
import Header from "@/components/Header";
import {withPageAuthRequired} from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import {Button, Icon, Popover} from "@blueprintjs/core";
import { DateRangePicker } from "@blueprintjs/datetime";
import {useState} from "react";
import {friendlyDateRange, DateRange} from "@/lib/dateUtils";
import {DateTime} from "luxon";
import {AdminUniqueUsersPanel} from "@/components/AdminUniqueUsersPanel";
import {AdminDailyMessageCountsPanel} from "@/components/AdminDailyMessageCountsPanel";
import {AdminMonthlyMessageCountsPanel} from "@/components/AdminMonthlyMessageCountsPanel";
import {AdminDailyUsersPanel} from "@/components/AdminDailyUsersPanel";
import {AdminMonthlyUsersPanel} from "@/components/AdminMonthlyUsersPanel";
import {AdminTopTenantsPanel} from "@/components/AdminTopTenantsPanel";

// By default, set our date range to the past month
const tz = 'Europe/London'
const defaultStart = DateTime.now().setZone(tz).minus({month: 1}).plus({day: 1}).toJSDate()
const defaultEnd = DateTime.now().setZone(tz).toJSDate()

function AdminReports() {
    const [dateRange, setDateRange] = useState<DateRange>([defaultStart, defaultEnd])
    const [pickerDateRange, setPickerDateRange] = useState<DateRange>([defaultStart, defaultEnd])

    const dateRangeDiffMs = dateRange[1].getTime() - dateRange[0].getTime()
    const isLongDateRange = dateRangeDiffMs > (1000 * 60 * 60 * 24 * 31)

    return (
        <div className="flex flex-col min-h-screen">
            <Head>
                <title>Admin Reports - CiCi Dashboard</title>
            </Head>
            <Header>
                <div className="flex justify-end">
                    <div className="flex-grow-0 px-2">
                        <Popover
                            content={
                                <DateRangePicker
                                    onChange={setPickerDateRange}
                                    allowSingleDayRange={true}
                                    maxDate={new Date()}
                                    value={pickerDateRange}
                                />
                            }
                            usePortal={false}
                            onClose={() => {
                                const [pickerStart, pickerEnd] = pickerDateRange
                                if (!pickerStart && !pickerEnd) {
                                    return
                                }
                                const start = pickerStart ?? pickerEnd
                                const end = pickerEnd ?? pickerStart
                                setDateRange([start, end])
                            }}
                        >
                            <Button style={{background: '#007A7A', color: 'white'}}>
                                <div className="flex flex-row items-center gap-x-4 px-2">
                                    <div><Icon icon="calendar" style={{color: 'white'}}/></div>
                                    <div
                                        className="whitespace-nowrap hidden sm:block">{friendlyDateRange(dateRange)}</div>
                                </div>
                            </Button>
                        </Popover>
                    </div>
                </div>
            </Header>
            <div className="grow pb-10 h-full" style={{backgroundColor: '#E8E6E5'}}>
                <div className="mx-auto max-w-6xl px-4 pt-4">
                    <ScreenHeader title="Admin Reports"/>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="basis-[200px] grow">
                            <AdminUniqueUsersPanel dateRange={dateRange}/>
                        </div>
                        <div className="basis-[200px] grow">
                            <AdminTopTenantsPanel dateRange={dateRange}/>
                        </div>
                        <div className="basis-[400px] max-w-[800px] grow">
                            {isLongDateRange
                                ? <AdminMonthlyMessageCountsPanel dateRange={dateRange}/>
                                : <AdminDailyMessageCountsPanel dateRange={dateRange}/>
                            }
                        </div>
                        <div className="basis-[400px] max-w-[800px] grow">
                            {isLongDateRange
                                ? <AdminMonthlyUsersPanel dateRange={dateRange}/>
                                : <AdminDailyUsersPanel dateRange={dateRange}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withPageAuthRequired(AdminReports);
