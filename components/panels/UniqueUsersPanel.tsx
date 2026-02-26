import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

export const UniqueUsersPanel = () => {

    const noData = () => false;

    const render = (data) => <p>
        There were <span className="font-bold" style={{
        color: COLOURS[2]
    }}>{data.totalUsers} unique users</span> in this period:
        <ul className="list-disc list-inside mt-2 ml-2">
            <li><span className="font-bold" style={{
                color: COLOURS[6]
            }}>{data.newUsers} new</span></li>
            <li className="mt-1"><span className="font-bold" style={{
                color: COLOURS[0]
            }}>{data.existingUsers} existing</span></li>
        </ul>
    </p>

    return <Panel
        title="Unique Users"
        endpoint='unique-users'
        render={render}
        hasNoData={noData}
    />
}