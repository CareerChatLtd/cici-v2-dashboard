import {Button, Icon, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";

export const YesNoFilter = ({value, onChange}: {
    value: boolean | null;
    onChange: (answer: boolean | null) => void;
}) => {
    return (
        <Select
            items={[
                {
                    label: 'Yes',
                    value: true
                }, {
                    label: 'No',
                    value: false
                }]}
            itemRenderer={(type, {handleClick}) => (
                <MenuItem
                    text={type.label}
                    key={type.label}
                    onClick={handleClick}
                    selected={type.value === value}
                    roleStructure="listoption"
                />
            )}
            onItemSelect={option => {
                onChange(value === option.value ? null : option.value)
            }}
            filterable={false}
        ><Button
            text={value === null ? 'Any' : value ? 'Yes' : 'No'}
            style={{background: '#007A7A', color: 'white'}}
            endIcon={<Icon icon="caret-down" style={{color: 'white'}}/>}/>
        </Select>
    )
}