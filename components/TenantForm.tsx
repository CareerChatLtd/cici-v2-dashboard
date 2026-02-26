import {Button, Card, Checkbox, FormGroup, Icon, InputGroup, Label, TextArea} from "@blueprintjs/core";
import React, {useRef, useState} from "react";
import {toLowerCamelCase} from "@/lib/stringUtils";
import {getShortLinkForShortId} from "@/lib/shortLinks";
import {useRouter} from "next/router";
import {TopicCheckboxes} from "@/components/TopicCheckboxes";
import {Question, Tenant} from "@/lib/types";
import Link from "next/link";

interface TenantFormProps {
    tenant: Partial<Tenant>;
    questions: Question[];
}

export const TenantForm = ({tenant, questions}: TenantFormProps) => {

    const idRef = useRef<HTMLInputElement>(null)
    const [idManuallySet, setIdManuallySet] = useState(false)

    const [shortId, setShortId] = useState(tenant.shortId)

    const router = useRouter()

    const nameChangeHandler = (v: React.ChangeEvent<HTMLInputElement>) => {
        if (idRef.current && !tenant.id && !idManuallySet) {
            // If we're on the 'add' screen, and the ID hasn't been set manually
            // by the user, then auto-generate one based on the org name
            const alphaOnly = v.target.value.replaceAll(/[^a-z0-9 ]/gi, '')
            idRef.current.value = toLowerCamelCase(alphaOnly)
        }
    }

    const idChangeHandler = (v: React.KeyboardEvent<HTMLInputElement>) => {
        setIdManuallySet(v.currentTarget.value.trim() !== '')
    }

    const shortIdChangeHandler = (v: React.KeyboardEvent<HTMLInputElement>) => {
        const trimmed = v.currentTarget.value.trim()
        setShortId(trimmed.length ? trimmed : null)
    }

    const shortIdUrl = getShortLinkForShortId(shortId)
    const CopyButton = () => <button type='button' className='-mt-1 hover:text-blue-900' title='Copy URL'
                                     onClick={async () => {
                                         await navigator.clipboard.writeText(shortIdUrl);
                                         alert('URL copied to clipboard')
                                     }}><Icon icon="duplicate" size={12} className="!ml-2"/></button>
    const shortIdHelperText = shortId ? <div className='flex items-center ml-3 text-xs'>
        <a className='' href={shortIdUrl} target="_blank">{shortIdUrl}</a>
        <CopyButton/>
    </div> : `Very short ID that will be used on printed materials, e.g. "gwr" or "7263"`

    const shortIdHasChanged = tenant.shortId && shortId !== tenant.shortId;

    return (<div className="w-full flex flex-row flex-wrap gap-6">
        <div className="w-[18rem]">
            <Card>
                <h2 className="font-bold text-16 mb-4">Organisation details</h2>
                <FormGroup
                    label="Organisation Name"
                    labelInfo="(required)"
                >
                    <InputGroup
                        name="name"
                        required={true}
                        defaultValue={tenant.name}
                        onChange={nameChangeHandler}
                    />
                </FormGroup>

                <Label>Website
                    <InputGroup
                        name="website"
                        defaultValue={tenant.website}/>
                </Label>
            </Card>

            <Card className="mt-5">
                <h2 className="font-bold text-16 mb-4">Chatbot settings</h2>
                {!tenant.id && <FormGroup
                    label="ID"
                    labelInfo="(required)"
                    helperText="No spaces, lowerCamelCase"
                >
                    <InputGroup
                        inputRef={idRef}
                        name="id"
                        required={true}
                        defaultValue={tenant.id}
                        style={{width: '15em'}}
                        onKeyUp={idChangeHandler}
                    />
                </FormGroup>}

                <FormGroup
                    label="Short ID"
                    helperText={shortIdHelperText}
                    subLabel={shortIdHasChanged ? 'Are you sure the previous URL is not still in use?' : null}
                    intent={shortIdHasChanged ? 'warning' : null}
                >
                    <InputGroup
                        intent={shortIdHasChanged ? 'warning' : null}
                        name="shortId"
                        defaultValue={tenant.shortId}
                        style={{width: '10em'}}
                        onKeyUp={shortIdChangeHandler}
                    />
                </FormGroup>

                <FormGroup
                    label="Passcode"
                    helperText="4 numbers"
                >
                    <InputGroup
                        name="passcode"
                        defaultValue={tenant.passcode}
                        style={{width: '5em'}}
                    />
                </FormGroup>

                <FormGroup
                    label="Disclaimer"
                    helperText="Supports Markdown"
                >
                    <TextArea
                        name="disclaimer"
                        className="min-w-full"
                        defaultValue={tenant.disclaimer}
                        rows={4}
                    />
                </FormGroup>

                <Label>Alternative introduction
                    <InputGroup
                        name="intro"
                        defaultValue={tenant.intro}
                        placeholder="e.g. Hi, I'm CiCi..."
                    />
                </Label>


                <FormGroup
                    label="Apprenticeship UKPRN"
                    helperText="8 digits, starting with the number 1"
                >
                    <InputGroup
                        name="apprenticeshipUkprn"
                        defaultValue={tenant.apprenticeshipUkprn}
                        style={{width: '9em'}}
                    />
                </FormGroup>
            </Card>

        </div>

        <div className="w-[18rem]">

            <Card>
                <h2 className="font-bold text-16 mb-4">Built-in Questions</h2>
                {questions.map((question) => (<Checkbox
                    className="ml-1 text-xs"
                    name="questions"
                    value={question.id.toString()}
                    key={question.id}
                    defaultChecked={tenant.questions?.includes(question.id.toString())}
                    label={question.name}
                />))}
            </Card>

            <Card className='mt-5 flex justify-start'>
                <Button
                    icon="wrench"
                    text="Custom Questions"
                    onClick={() => router.push(`/tenants/${tenant.id}/questions`)}
                />
            </Card>

            <Card className="mt-5">
                <h2 className="font-bold text-16 mb-4">Handover</h2>
                <Label>Recipient email address
                    <InputGroup
                        name="handoverEmail"
                        type="email"
                        defaultValue={tenant.handoverEmail}
                    />
                </Label>

                <Card className="mb-5">
                    <p className="text-gray-600 text-xs mb-3">We will always ask the user for their email address, but
                        in addition...</p>

                    <Checkbox
                        name="handoverAskForFullName"
                        defaultChecked={tenant.handoverAskForFullName}
                        label={"Ask for full name?"}
                    />
                    <Checkbox
                        name="handoverAskForPhoneNumber"
                        defaultChecked={tenant.handoverAskForPhoneNumber}
                        label={"Ask for phone number?"}
                    />
                    <Checkbox
                        name="handoverAskForStudentNumber"
                        defaultChecked={tenant.handoverAskForStudentNumber}
                        label={"Ask for student number?"}
                    />
                </Card>

                <Label>Success message
                    <TextArea
                        name="handoverSuccessMessage"
                        className="min-w-full"
                        defaultValue={tenant.handoverSuccessMessage}
                    />
                </Label>
            </Card>

            <Card className="mt-5">
                <h2 className="font-bold text-16 mb-4">Safeguarding</h2>

                <Checkbox
                    name="usersAreUnder18"
                    defaultChecked={tenant.usersAreUnder18}
                    label="Treat all users as under 18"
                />

                <FormGroup
                    className="pt-3"
                    label="Message to user (low risk)"
                    helperText="Supports Markdown"
                >
                    <TextArea
                        name="safeguardingMessageLow"
                        className="min-w-full"
                        defaultValue={tenant.safeguardingMessageLow}
                        rows={4}
                    />
                </FormGroup>

                <FormGroup
                    label="Message to user (high risk)"
                    helperText="Supports Markdown"
                >
                    <TextArea
                        name="safeguardingMessageHigh"
                        className="min-w-full"
                        defaultValue={tenant.safeguardingMessageHigh}
                        rows={4}
                    />
                </FormGroup>

                <div className="mt-3 text-xs text-right">
                    <Link href="/high-risk-safeguarding-responses" className="default-link">
                        See default responses
                    </Link>
                </div>
            </Card>

        </div>

        <div className="w-[18rem]">

            <Card>
                <h2 className="font-bold text-16 mb-4">Topics to hide</h2>
                <TopicCheckboxes value={tenant.hideTopics ?? []} name="hideTopics"/>
            </Card>

        </div>
    </div>)
}