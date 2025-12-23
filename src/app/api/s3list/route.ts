import { logger } from '@/libs/Logger';
import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' , credentials:{
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3 || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3 || ''
}});

const tracesBucketName = process.env.S3_BUCKET_NAME || '';

export async function GET(request: Request) {
    const sessionId = request.headers.get('X-Session-Id');
    logger.info(`Listing S3 files for session: ${sessionId}`);
    if (!sessionId || sessionId.length < 3) {
        return NextResponse.json({ error: 'Session ID not provided' }, { status: 400 });
    }
    

    try {
        const bucketName = tracesBucketName;
        let s3prefix = process.env.S3_KEY_PREFIX || 'monocle_trace_';
        let prefix = `${s3prefix}${sessionId}`;
        const listParams = {
            Bucket: bucketName,
            Prefix: prefix
        };

        const command = new ListObjectsV2Command(listParams);
        const data = await s3Client.send(command);

        if (!data.Contents) {
            return NextResponse.json({ files: [] });
        }

        // Sort files by LastModified in descending order
        const sortedContents = data.Contents.sort((a, b) => {
            const dateA = a.LastModified ? new Date(a.LastModified).getTime() : 0;
            const dateB = b.LastModified ? new Date(b.LastModified).getTime() : 0;
            return dateB - dateA;
        });

        const files = await Promise.all(
            sortedContents.map(async (item) => {
                return {
                    key: item.Key,
                    lastModified: item.LastModified,
                };
            })
        );

        return NextResponse.json({ files });
    } catch (error) {
        logger.error(error, `Error listing S3 files for session ${sessionId}`);
        return NextResponse.json({ error: 'Error listing S3 files' }, { status: 500 });
    }
}
