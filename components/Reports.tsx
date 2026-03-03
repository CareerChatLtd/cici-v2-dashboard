import {Button, FocusStyleManager, Icon, Popover} from '@blueprintjs/core'
import {Fragment, useEffect, useState} from "react"
import {DailyUsersPanel} from "@/components/panels/DailyUsersPanel";
import Header from "@/components/Header";
import {TimeOfDayPanel} from "@/components/panels/TimeOfDayPanel";
import {HandoverPanel} from "@/components/panels/HandoverPanel";
import {makeApiRequestForTenant} from "@/lib/apiUtils";
import Head from "next/head";
import {MonthlyUsersPanel} from "@/components/panels/MonthlyUsersPanel";
import {ChoicePanel} from "@/components/panels/ChoicePanel";
import {YesNoPanel} from "@/components/panels/YesNoPanel";
import {TextPanel} from "@/components/panels/TextPanel";
import {friendlyDateRange} from "@/lib/dateUtils";
import {withTenant} from "@/lib/auth";
import {useReportContext} from "@/components/ReportContextProvider";
import {UniqueUsersPanel} from "@/components/panels/UniqueUsersPanel";
import {MonthlyMessageCountsPanel} from "@/components/panels/MonthlyMessageCountsPanel";
import {DailyMessageCountsPanel} from "@/components/panels/DailyMessageCountsPanel";
import {DateRangePicker} from "@blueprintjs/datetime";
import {FilterPanel} from "@/components/FilterPanel";
import {SafeguardingPanel} from "@/components/panels/SafeguardingPanel";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const Reports = ({tenant}) => {
    const {dateRange, setDateRange, setTenantId, filterCount} = useReportContext();
    const [customQuestions, setCustomQuestions] = useState([])
    const [pickerDateRange, setPickerDateRange] = useState(dateRange)
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        setTenantId(tenant.id)

        // Get all custom questions for this tenant
        makeApiRequestForTenant(tenant.id, 'questions').then(data => {
            setCustomQuestions(data)
        })
    }, [tenant])

    return (
        <div className="flex flex-col h-screen">
            <Head>
                <title>Reports - CiCi Dashboard</title>
            </Head>
            <Header tenant={tenant}>
                <div className="flex justify-end">
                    <div className="flex-grow-0 px-2 hidden sm:block">
                        <Button style={{background: '#007A7A', color: 'white'}}
                                onClick={() => setShowFilters(!showFilters)}>
                            <div className="flex flex-row items-center gap-x-4 px-2 relative">
                                <div>
                                    <Icon icon={'filter'} style={{color: 'white'}}/>
                                </div>
                                {filterCount > 0 && (
                                    <div
                                        className='bg-red-700 text-white text-xs w-5 h-5 rounded-full absolute -top-3 -right-4 flex items-center justify-center leading-none font-mono'>
                                        <span>{filterCount}</span>
                                    </div>
                                )}
                            </div>
                        </Button>
                    </div>
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
            <div className="pb-10" style={{backgroundColor: '#E8E6E5'}}>
                <div className="mx-auto max-w-6xl px-4">

                    {showFilters && (
                        <FilterPanel tenant={tenant}/>
                    )}

                    <div className="mt-4 flex flex-col gap-8">

                        <div>
                            <h2 className="text-lg mb-3">Interactions</h2>
                            <div className="panel-wrapper">

                                <div className="panel-large">
                                    {(Number(dateRange[1]) - Number(dateRange[0])) > (1000 * 60 * 60 * 24 * 31)
                                        ? <MonthlyMessageCountsPanel/>
                                        : <DailyMessageCountsPanel/>
                                    }
                                </div>

                                <div className="panel-small">
                                    <UniqueUsersPanel/>
                                </div>

                                <div className="panel-large">
                                    {(Number(dateRange[1]) - Number(dateRange[0])) > (1000 * 60 * 60 * 24 * 31)
                                        ? <MonthlyUsersPanel/>
                                        : <DailyUsersPanel/>
                                    }
                                </div>

                                <div className="panel-large">
                                    <TimeOfDayPanel/>
                                </div>

                                <div className="panel-large">
                                    <HandoverPanel/>
                                </div>

                                <div className="panel-large">
                                    <SafeguardingPanel/>
                                </div>
                            </div>
                        </div>

                        {customQuestions.length > 0 && (
                            <div>
                                <h2 className="text-lg mb-3">Questions</h2>
                                <div className="panel-wrapper">
                                    {customQuestions.map(question => (
                                        <Fragment key={question.id}>
                                            {['singleChoice', 'multipleChoice'].includes(question.type) &&
                                                <div className="panel-small">
                                                    <ChoicePanel questionId={question.id} title={question.name}/>
                                                </div>}
                                            {question.type === 'yesNo' &&
                                                <div className="panel-small">
                                                    <YesNoPanel questionId={question.id} title={question.name}/>
                                                </div>}
                                            {question.type === 'text' &&
                                                <div className="panel-small">
                                                    <TextPanel questionId={question.id} title={question.name}/>
                                                </div>}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withTenant(Reports)
