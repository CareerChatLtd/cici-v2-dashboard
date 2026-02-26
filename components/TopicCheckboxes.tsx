import {Checkbox} from "@blueprintjs/core";
import {topics} from "@/lib/topics";
import {useEffect, useState} from "react";

const topLevelTopicKeys = Object.keys(topics).filter(key => topics[key].childOf === null);

const topicList = topLevelTopicKeys.map(key => {
    const topic = topics[key]
    const childKeys = Object.keys(topics).filter(childKey => topics[childKey].childOf === key)
    return {
        id: key,
        name: topic.name,
        children: childKeys.map(childKey => {
            const subTopic = topics[childKey]
            return {
                id: childKey,
                name: subTopic.name,
            }
        }),
    }
})

type TopicId = string

interface Props {
    value: Array<TopicId>;
    name: string;
    onChange?: (value: Array<TopicId>) => void;
}

export const TopicCheckboxes = ({value, name, onChange}: Props) => {

    // The filter is just to remove any topics that no longer exist
    const [currentValue, setCurrentValue] = useState(value.filter(v => v in topics))

    const makeOnChange = (id: TopicId) => () => {
        if (currentValue.includes(id)) {
            setCurrentValue([...currentValue.filter(v => v !== id)])
        } else {
            setCurrentValue([...currentValue, id])
        }
    }

    useEffect(() => {
        onChange?.(currentValue)
    }, [currentValue])

    return (
        <div>
            {topicList.map((topic) => (<div key={topic.id}>
                    <Checkbox
                        name={name}
                        value={topic.id}
                        checked={currentValue.includes(topic.id)}
                        label={topic.name}
                        className="ml-1 font-semibold text-xs"
                        onChange={makeOnChange(topic.id)}
                    />
                    {topic.children && topic.children.length > 0 && (
                        <div className="ml-2.5 pl-3 border-l border-gray-200 space-y-2">
                            {topic.children.map((child) => (
                                <div key={child.id} className="">
                                    <Checkbox
                                        name="hideTopics"
                                        value={child.id}
                                        checked={currentValue.includes(child.id)}
                                        label={child.name}
                                        className="text-xs"
                                        onChange={makeOnChange(child.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}