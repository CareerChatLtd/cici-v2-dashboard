import * as path from "path";
import {fileURLToPath} from 'url';
import {withAdminCheck} from "@/lib/auth-server";
import {downloadFile} from "@/lib/files";

export default withAdminCheck(async (req, res) => {

    const rawData = req.body as unknown

    if (typeof rawData !== 'object' || rawData === null) {
        return res.status(400).json({message: 'Invalid data'});
    }

    if (!('coursesUrl' in rawData) || typeof rawData.coursesUrl !== 'string') {
        return res.status(400).json({message: 'Invalid course url'});
    }
    if (!('providersUrl' in rawData) || typeof rawData.providersUrl !== 'string') {
        return res.status(400).json({message: 'Invalid provider url'});
    }


    const trimmedData = {
        coursesUrl: rawData.coursesUrl.trim(),
        providersUrl: rawData.providersUrl.trim(),
    }

    const errors = []

    const pathRegex = /https:\/\/assets.publishing.service.gov.uk\/.*?.csv/i

    if (!pathRegex.test(trimmedData.coursesUrl)) {
        errors.push(`Courses URL doesn't match our trusted sources`)
    }
    if (!pathRegex.test(trimmedData.providersUrl)) {
        errors.push(`Providers URL doesn't match our trusted sources`)
    }

    if (errors.length) {
        return res.status(400).json({errors});
    }

    const thisFilePath = fileURLToPath(import.meta.url)
    const dataPath = path.join(thisFilePath, '..', '..', '..', 'data/downloads/')
    const {coursesUrl, providersUrl} = trimmedData

    try {
        // Download file
        await downloadFile(providersUrl, path.join(dataPath, 'providers.csv'))
        await downloadFile(coursesUrl, path.join(dataPath, 'courses.csv'))

        return res.status(200).json({message: 'Files downloaded and unzipped'})
    } catch (err) {
        console.log(err.stack)
        return res.status(500).json({error: err.message})
    }
})
