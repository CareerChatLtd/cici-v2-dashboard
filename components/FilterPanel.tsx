import {Button} from "@blueprintjs/core";
import {CustomQuestionFilters} from "@/components/CustomQuestionFilters";
import {useReportContext} from "./ReportContextProvider";
import {Tenant} from "@/lib/types";

export const FilterPanel = ({tenant}: { tenant: Tenant }) => {
    const {filterCount, clearFilters} = useReportContext();

    return (
        <div
            className="p-4 bg-gray-300 flex flex-col md:flex-row gap-x-8 gap-y-5 rounded-b-lg">
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