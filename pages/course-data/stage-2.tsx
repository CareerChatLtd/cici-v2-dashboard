import {Button, FocusStyleManager, Spinner} from '@blueprintjs/core'
import {useState} from "react";
import Head from "next/head";
import Header from "@/components/Header";
import {ErrorBlock} from "@/lib/cms/error-block";
import {SuccessBlock} from "@/lib/cms/success-block";
import Link from "next/link";
import {withAdminUser} from "@/lib/auth";

// Hide the blue outline when using the mouse that looks a bit weird on things like popover
FocusStyleManager.onlyShowFocusOnTabs();

const CourseDataStage2 = () => {

    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [updated, setUpdated] = useState(false)
    const [loading, setLoading] = useState(false)


    const begin = (e) => {
        setLoading(true);
        e.preventDefault()

        fetch(`/api/import-course-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(res => res.json())
            .then(({error, message}) => {
                setLoading(false)
                setErrorMessage(error)
                setSuccessMessage(error ? '' : message)
                if (!error) {
                    setUpdated(true)
                }
            })
            .catch(error => {
                setErrorMessage(error)
                setLoading(false)
            });
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#E8E6E5'}}>
            <Head>
                <title>Update Course Data - CiCi Dashboard</title>
            </Head>
            <Header />

            <div className="mx-auto max-w-6xl px-4 mt-4 pb-10">
                <h1 className="text-lg mb-3">Stage 2: Add Course Data to DB</h1>

                {loading
                    ? <div><Spinner/><p>Inserting course data. This may take a minute...</p></div>
                    :
                    <div>

                        <ErrorBlock errorMessages={errorMessage ? [errorMessage] : []}/>
                        <SuccessBlock successMessage={successMessage}/>

                        {updated
                            ?
                            <div className="my-4">
                                <p><Link href={`/`}>Return to dashboard</Link></p>
                            </div>
                            :

                            <Button
                                type="submit"
                                intent="primary"
                                text="Load data"
                                size="large"
                                className="mt-4"
                                onClick={begin}
                            />
                        }

                    </div>
                }
            </div>
        </div>
    )
}

export default withAdminUser(CourseDataStage2)
