import {Button, FocusStyleManager, FormGroup, InputGroup, Spinner} from '@blueprintjs/core'
import React, {useState} from "react";
import Head from "next/head";
import Header from "@/components/Header";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import Link from "next/link";
import ScreenHeader from "@/components/ScreenHeader";
import {withAdminUser} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const CourseDataStage1 = () => {
    const [errorMessages, setErrorMessages] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const [updated, setUpdated] = useState(false)
    const [loading, setLoading] = useState(false)

    const save = (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault()
        const form = new FormData(e.currentTarget)

        const data = {
            coursesUrl: String(form.get('coursesUrl')).trim(),
            providersUrl: String(form.get('providersUrl')).trim(),
        }

        fetch(`/api/upload-course-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(res => res.json())
            .then(({_, errors}) => {
                setLoading(false)
                setErrorMessages(errors ?? [])
                setSuccessMessage(errors ? '' : 'Course data successfully uploaded')
                if (!errors) {
                    setUpdated(true)
                }
            });
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Update course data - CiCi Dashboard</title>
            </Head>
            <Header/>

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <ScreenHeader backLink="/manage" title="Course data"/>
                <h2 className="text-base mb-3">Stage 1: Upload Course Data</h2>

                {loading
                    ? <div><Spinner/><p>Uploading course data. This can take a couple of minutes...</p></div>
                    :
                    <div>

                        <ErrorBlock errorMessages={errorMessages}/>
                        <SuccessBlock successMessage={successMessage}/>

                        {updated
                            ?
                            <div className="my-4">
                                <p><Link href={`/course-data/stage-2`}>Stage 2: Add course data to database</Link></p>
                                <p className="mt-4 text-xs"><Link href={`/manage`}>Cancel and return</Link></p>
                            </div>
                            :
                            <form
                                onSubmit={save}
                                action=""
                            >
                                <p className="mb-5">See <a className="underline" target="_blank"
                                                           href="https://www.gov.uk/government/publications/national-careers-service-course-directory">www.gov.uk/government/publications/national-careers-service-course-directory</a>
                                </p>
                                <FormGroup
                                    label="Providers CSV file"
                                >
                                    <InputGroup
                                        name="providersUrl"
                                        placeholder="e.g. https://assets.publishing.service.gov.uk/media/67c97c61696e4984ea4cf2ed/Live_Course_Providers_Report_February_2025.csv"
                                    />
                                </FormGroup>

                                <FormGroup
                                    label="Courses CSV file"
                                >
                                    <InputGroup
                                        name="coursesUrl"
                                        placeholder="e.g. https://assets.publishing.service.gov.uk/media/67c97c952ecc810ad1fc662e/Live_Courses_With_Regions_And_Venues_Report_February_2025.csv"
                                    />
                                </FormGroup>

                                <Button
                                    type="submit"
                                    intent="primary"
                                    text="Begin upload"
                                    size="large"
                                    className="mt-4"
                                />
                            </form>
                        }

                    </div>
                }
            </div>
        </div>
    )
}

export default withAdminUser(CourseDataStage1)
