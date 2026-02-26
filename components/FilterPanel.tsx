import {Button, FormGroup} from "@blueprintjs/core";
import {ageBrackets} from "@/lib/ages";
import {CustomQuestionFilters} from "@/components/CustomQuestionFilters";
import {useReportContext} from "./ReportContextProvider";
import {Tenant} from "@/lib/types";
import {SingleChoiceFilter} from "@/components/SingleChoiceFilter";

export const FilterPanel = ({tenant}: { tenant: Tenant }) => {
    const {ageBracket, setAgeBracket, filterCount, clearFilters} = useReportContext();

    return (
        <div
            className="p-4 bg-gray-300 flex flex-col md:flex-row gap-x-8 gap-y-5 rounded-b-lg">
            {tenant.questions.includes('age') && (
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-600 mb-3">Built-in questions</h3>
                    <FormGroup label="Age">
                        <SingleChoiceFilter
                            options={ageBrackets.map(({name}) => [name, name])}
                            value={ageBracket?.name ?? null}
                            onChange={(bracket) => {
                                const value = (bracket === 'All') ? null : ageBrackets.find(a => a.name === bracket)
                                setAgeBracket(value)
                            }}
                        />
                    </FormGroup>
                </div>)}
            <div className="grow">
                <CustomQuestionFilters tenant={tenant}/>
            </div>
            <div className="flex flex-initial justify-end items-start -mx-4">
                {filterCount > 0 && (
                    <Button
                        icon="delete"
                        size={'small'}
                        className="mx-4"
                        variant={'minimal'}
                        onClick={clearFilters}
                    >Clear filters</Button>
                )}
            </div>
        </div>
    )
}