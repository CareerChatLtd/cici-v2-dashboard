import * as path from "path";
import {fileURLToPath} from 'url';
import * as fs from "fs";
import {withAdminCheck} from "@/lib/auth";
import {downloadFile} from "@/lib/files";

export default withAdminCheck(async (req, res) => {

    const rawData = req.body

    // Trim all strings
    const trimmedData = {}
    Object.entries(rawData).forEach(([k, v]) => {
        trimmedData[k] = (typeof v === 'string') ? v.trim() : v
    })

    const errors = []

    const pathRegex = /https:\/\/assets.publishing.service.gov.uk\/(?:.*?).csv/i

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
