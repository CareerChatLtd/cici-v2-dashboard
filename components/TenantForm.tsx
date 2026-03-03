import {Button, Card, Checkbox, FormGroup, Icon, InputGroup, Label, TextArea} from "@blueprintjs/core";
import React, {useRef, useState} from "react";
import {toLowerCamelCase} from "@/lib/stringUtils";
import {getBotShortUrl} from "@/lib/shortLinks";
import {useRouter} from "next/router";
import {Tenant} from "@/lib/types";
import Link from "next/link";

interface TenantFormProps {
    tenant: Partial<Tenant>;
}

export const TenantForm = ({tenant}: TenantFormProps) => {

    const slugRef = useRef<HTMLInputElement>(null)
    const [slugManuallySet, setSlugManuallySet] = useState(false)

    const [shortSlug, setShortSlug] = useState(tenant.shortSlug)

    const router = useRouter()

    const nameChangeHandler = (v: React.ChangeEvent<HTMLInputElement>) => {
        if (slugRef.current && !tenant.slug && !slugManuallySet) {
            // If we're on the 'add' screen, and the slug hasn't been set manually
            // by the user, then auto-generate one based on the org name
            const alphaOnly = v.target.value.replaceAll(/[^a-z0-9 ]/gi, '')
            slugRef.current.value = toLowerCamelCase(alphaOnly)
        }
    }

    const slugChangeHandler = (v: React.KeyboardEvent<HTMLInputElement>) => {
        setSlugManuallySet(v.currentTarget.value.trim() !== '')
    }

    const shortSlugChangeHandler = (v: React.KeyboardEvent<HTMLInputElement>) => {
        const trimmed = v.currentTarget.value.trim()
        setShortSlug(trimmed.length ? trimmed : null)
    }

    const shortSlugUrl = getBotShortUrl(shortSlug)
    const CopyButton = () => <button type='button' className='-mt-1 hover:text-blue-900' title='Copy URL'
                                     onClick={async () => {
                                         await navigator.clipboard.writeText(shortSlugUrl);
                                         alert('URL copied to clipboard')
                                     }}><Icon icon="duplicate" size={12} className="!ml-2"/></button>
    const shortSlugHelperText = shortSlug ? <div className='flex items-center ml-3 text-xs'>
        <a className='' href={shortSlugUrl} target="_blank">{shortSlugUrl}</a>
        <CopyButton/>
    </div> : `Very short slug that will be used on printed materials, e.g. "gwr" or "7263"`

    const shortSlugHasChanged = tenant.shortSlug && shortSlug !== tenant.shortSlug;

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
                {!tenant.slug && <FormGroup
                    label="Slug"
                    labelInfo="(required)"
                    helperText="No spaces, lowerCamelCase"
                >
                    <InputGroup
                        inputRef={slugRef}
                        name="slug"
                        required={true}
                        defaultValue={tenant.slug}
                        style={{width: '15em'}}
                        onKeyUp={slugChangeHandler}
                    />
                </FormGroup>}

                <FormGroup
                    label="Short Slug"
                    helperText={shortSlugHelperText}
                    subLabel={shortSlugHasChanged ? 'Are you sure the previous URL is not still in use?' : null}
                    intent={shortSlugHasChanged ? 'warning' : null}
                >
                    <InputGroup
                        intent={shortSlugHasChanged ? 'warning' : null}
                        name="shortSlug"
                        defaultValue={tenant.shortSlug}
                        style={{width: '10em'}}
                        onKeyUp={shortSlugChangeHandler}
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

                <Label>Alternative introduction
                    <InputGroup
                        name="intro"
                        defaultValue={tenant.intro}
                        placeholder="e.g. Hi, I'm CiCi..."
                    />
                </Label>
            </Card>

        </div>

        <div className="w-[18rem]">

            <Card className='flex justify-start'>
                <Button
                    icon="wrench"
                    text="Custom Questions"
                    onClick={() => router.push(`/tenants/${tenant.slug}/questions`)}
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
    </div>)
}
