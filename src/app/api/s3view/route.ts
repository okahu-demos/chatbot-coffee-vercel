import { logger } from '@/libs/Logger';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_S3 || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_S3 || ''
    }
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const sessionId = request.headers.get('X-Session-Id');

    if (!key || !sessionId) {
        return NextResponse.json({ error: 'Missing key or session ID' }, { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: key
        });

        const response = await s3Client.send(command);
        
        if (!response.Body) {
            throw new Error('No body in response');
        }

        // Convert the readable stream to text
        const streamReader = response.Body.transformToWebStream();
        const decoder = new TextDecoderStream();
        const textStream = streamReader.pipeThrough(decoder);
        const reader = textStream.getReader();
        
        let content = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            content += value;
        }

        return new NextResponse(content, {
            headers: {
                'Content-Type': response.ContentType || 'application/json',
                'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
            },
        });

    } catch (error) {
        logger.error(error, `Error downloading file ${key}`);
        return NextResponse.json({ error: 'Error downloading file' }, { status: 500 });
    }
}
