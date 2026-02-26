import {Button, Card, Elevation, FocusStyleManager, Icon, MenuItem, Popover, Spinner} from '@blueprintjs/core'
import {useEffect, useState} from "react";
import Head from "next/head";
import Header from "@/components/Header";
import ScreenHeader from "@/components/ScreenHeader";
import {ItemPredicate, ItemRenderer, Select} from "@blueprintjs/select";
import { DateRangePicker } from "@blueprintjs/datetime";
import {DateTime} from "luxon";
import {friendlyDateRange} from "@/lib/dateUtils";
import {makeApiRequestForDateRange} from "@/lib/apiUtils";
import {withAdminUser} from "@/lib/auth";
import Custom500 from "./500";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

interface Tenant {
    id: string
    name: string
}

interface Feedback {
    averageScore: number;
    numberOfRatings: number;
    responses: Array<{ message: string, rating: number }>;
}

const renderTenant: ItemRenderer<Tenant> = (tenant, {handleClick, handleFocus, modifiers}) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={tenant.id}
            onClick={handleClick}
            onFocus={handleFocus}
            roleStructure="listoption"
            text={tenant.name}
        />
    );
};

const filterTenant: ItemPredicate<Tenant> = (query, tenant, _index) => {
    const normalizedTitle = tenant.name.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    return normalizedTitle.includes(normalizedQuery);
};

// By default, set our date range to the past month
const tz = 'Europe/London'
const defaultStart = DateTime.now().setZone(tz).minus({month: 1}).plus({day: 1}).toJSDate()
const defaultEnd = DateTime.now().setZone(tz).toJSDate()

const Feedback = () => {
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [tenants, setTenants] = useState([])
    const [dateRange, setDateRange] = useState<[Date, Date]>([defaultStart, defaultEnd])
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`/api/tenants`)
            .then((res) => res.json())
            .then(({data, error}) => {
                if (!error) {
                    setTenants(data ?? [])
                } else {
                    setError(error)
                }
            }).catch(error => {
            setError(error)
        })
    }, [])

    useEffect(() => {
        if (!dateRange[0] || !dateRange[1]) {
            return
        }
        makeApiRequestForDateRange(tenant?.id, `feedback`, dateRange)
            .then((data) => {
                setFeedback(data)
            }).catch(error => {
            setError(error)
        }).finally(() => {
            setLoading(false)
        })
    }, [tenant, dateRange])

    if (error) {
        console.error(error)
        return <Custom500/>
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>User Feedback - CiCi Dashboard</title>
            </Head>

            <Header tenant={tenant}>
                <div className="flex justify-end">
                    <div className="flex-grow-0 px-2 hidden sm:block">
                    </div>
                    <div className="flex-grow-0 px-2">
                        <Popover
                            content={
                                <DateRangePicker
                                    onChange={setDateRange}
                                    allowSingleDayRange={true}
                                    maxDate={new Date()}
                                    value={dateRange}
                                />
                            }
                            usePortal={false}
                        >
                            <Button className="whitespace-nowrap" style={{background: '#007A7A', color: 'white'}}>
                                <Icon icon="calendar" style={{color: 'white', margin: '0 8px 0 2px'}}/>
                                <span>{friendlyDateRange(dateRange)}</span>
                            </Button>
                        </Popover>
                    </div>
                </div>
            </Header>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">

                <ScreenHeader
                    title={`User Feedback (${friendlyDateRange(dateRange)})`}
                />

                {loading ? <Spinner/>
                    :
                    <div>
                        <div id="search-panel" className="max-w-xs flex items-center">
                            <label className="flex flex-row items-center gap-5"><span>Tenant</span>
                                <Select<Tenant>
                                    items={[
                                        {id: null, name: 'All tenants...'},
                                        ...tenants
                                    ]}
                                    itemPredicate={filterTenant}
                                    onItemSelect={setTenant}
                                    itemRenderer={renderTenant}
                                >
                                    <Button text={tenant ? tenant.name : 'Choose Tenant'}
                                            endIcon="double-caret-vertical"/>
                                </Select>
                            </label>
                            {tenant && <Button
                                intent="danger"
                                icon="delete"
                                title="Delete option"
                                small
                                className="mx-4"
                                minimal
                                onClick={() => setTenant(null)}
                            />}
                        </div>

                        {feedback && <>
                            <Card interactive={true} elevation={Elevation.TWO} className='mt-5'>
                                <h2 className="text-xl font-bold">Average score: {feedback.averageScore}</h2>
                                <p className='mt-2'>Number of ratings: {feedback.numberOfRatings}</p>
                            </Card>


                            <table className="mt-4 w-full">
                                <thead>
                                <tr className="border-b border-gray-300 bg-gray-300">
                                    <th className="px-4 py-1 text-left w-5">Rating</th>
                                    <th className="px-4 py-1 text-left">Message</th>
                                </tr>
                                </thead>
                                <tbody>
                                {feedback.responses.map(({message, rating}, i) => (
                                    <tr key={i} className="border-b border-gray-300 hover:bg-gray-50">
                                        <td className="px-4 py-1 text-right">{rating}</td>
                                        <td className="px-4 py-1">{message}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                        }
                    </div>
                }
            </div>
        </div>
    );
}

export default withAdminUser(Feedback)
