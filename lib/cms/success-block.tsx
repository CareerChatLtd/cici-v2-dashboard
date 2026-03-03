import {Icon} from "@blueprintjs/core";

export const SuccessBlock = ({successMessage}: {successMessage: string}) => successMessage.length
    ? <p
        className="my-4"
        style={{color: 'green', fontWeight: 'bold'}}><Icon icon="tick-circle" style={{
        color: 'green',
        margin: '0 8px 0 0'
    }}/> {successMessage}</p>
    : null
