import fs from 'fs';
import {pipeline, Readable} from 'stream';
import {promisify} from 'util';

const streamPipeline = promisify(pipeline);

export async function downloadFile(url: string, outputPath: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Stream the response body directly to the file
    await streamPipeline(response.body as unknown as Readable, fs.createWriteStream(outputPath));

    console.log(`Downloaded: ${outputPath}`);
}

