"use strict"

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('config');

const s3Client = new S3Client({
    region: config.get('S3_BUCKET_REGION'),
    endpoint: 'https://hel1.your-objectstorage.com', // Hetzner endpoint
    credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY'),
        secretAccessKey: config.get('S3_SECRET_KEY'),
    },
    forcePathStyle: true, // sometimes required for non-AWS S3 providers
});

const BUCKET_NAME = config.get('S3_BUCKET_NAME');

async function hetznerMediaUploadFunction({ key, data, contentType, folderName }) {
    if (!key || !data) throw new Error('Key and data are required for upload');

    const finalKey = folderName ? `${folderName}/${key}` : key;

    const params = {
        Bucket: BUCKET_NAME,
        Key: finalKey,
        Body: data,
        ContentType: contentType,
    };
console.log("Final upload params:", params);

    await s3Client.send(new PutObjectCommand(params));
    const url = `https://hel1.your-objectstorage.com/${BUCKET_NAME}/${finalKey}`;
    return { statusCode: 200, message: "Media file uploaded successfully", url };
}

module.exports = { hetznerMediaUploadFunction };