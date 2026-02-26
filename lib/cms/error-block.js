import {Icon} from "@blueprintjs/core";

export const ErrorBlock = ({errorMessages}) => errorMessages.length > 0
    ? <ul
        className="my-4"
        style={{color: 'red', fontWeight: 'bold'}}
    >
        {errorMessages.map(m => <li key={m}><Icon icon="warning-sign" style={{
            color: 'red',
            margin: '0 8px 0 0'
        }}/> {m}</li>)}
    </ul>
    : null
