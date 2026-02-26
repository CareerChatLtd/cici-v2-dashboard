import {Button} from "@blueprintjs/core";
import {useRouter} from "next/router";
import {ReactNode} from "react";

interface Props {
    backLink?: string
    title: string
    rightSlot?: ReactNode
}

export default function ScreenHeader({backLink, title, rightSlot}: Props) {
    const router = useRouter()

    return (
        <div className="flex w-full items-center justify-between mb-8">
            <div className="flex items-center gap-x-2">
                {backLink && <Button
                    icon="chevron-left"
                    intent="primary"
                    variant="outlined"
                    onClick={() => {
                        router.push(backLink)
                    }}
                />}
                <h1 className="text-lg">{title}</h1>
            </div>
            {rightSlot}
        </div>
    )
}