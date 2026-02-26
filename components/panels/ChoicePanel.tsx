import {Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Panel} from "../Panel";
import {COLOURS} from "@/lib/colours";

const summariseData = (data) => {
    // Group the data by the selectedOptionText property
    return data.reduce((acc, {selectedOptionText}) => {
        const existing = acc.find(({name}) => name === selectedOptionText)
        if (existing) {
            existing.count++
        } else {
            acc.push({name: selectedOptionText, count: 1})
        }
        return acc
    }, [])
}

/**
 * Show a generic chart appropriate to all custom questions that have a single choice answer
 */
export const ChoicePanel = ({title, questionId}) => {
    const asCsv = (data) => ({
        columns: [
            ['name', 'Choice'],
            ['count', 'Count'],
        ], data: summariseData(data)
    });

    const noData = (data) => data.length === 0;

    const render = (rawData) => {
        const data = summariseData(rawData)
        return <ResponsiveContainer aspect={2}>
            <BarChart data={data} layout="vertical">
                <YAxis dataKey="name" tick={{fontSize: '10px'}} type="category" width={100} interval={0}/>
                <XAxis dataKey="count" tick={{fontSize: '10px'}} type="number" allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="count" fill={COLOURS[1]} layout="vertical">
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLOURS[i % COLOURS.length]}/>
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    }

    return <Panel
        title={title}
        endpoint={`question-responses?questionId=${questionId}`}
        render={render}
        asCsv={asCsv}
        hasNoData={noData}
    />
}
