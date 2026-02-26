import {Button, Icon, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/select";

export const SingleChoiceFilter = <T, >({options, value, onChange}: {
    options: Array<[T, string]>;
    value: T | null;
    onChange: (answer: T | null) => void;
}) => {

    const allOptions = [...options.map(([value, label]) => ({label, value}))]

    const currentOption = allOptions.find(o => o.value === value)

    return (
        <Select
            items={allOptions}
            itemRenderer={(type, {handleClick}) => (
                <MenuItem
                    textClassName={type.value === null ? "italic text-gray-600" : ''}
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
            text={value === null ? 'Any' : currentOption.label}
            style={{background: '#007A7A', color: 'white'}}
            endIcon={<Icon icon="caret-down" style={{color: 'white'}}/>}/>
        </Select>
    )
}