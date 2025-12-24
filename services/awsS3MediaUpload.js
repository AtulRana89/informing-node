// 'use strict';

// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const config = require('config');

// const awsS3Client = new S3Client({
//     region: config.get('S3_BUCKET_REGION'),
//     credentials: {
//         accessKeyId: config.get('S3_ACCESS_KEY'),
//         secretAccessKey: config.get('S3_SECRET_KEY'),
//     },
// });
// const S3_BUCKET_NAME = config.get('S3_BUCKET_NAME');

// async function awsS3MediaUploadFunction({ key, data, contentType, folderName }) {
//     if (!key || !data) throw new Error('Key and data are required for upload');
//     const finalKey = folderName ? `${folderName}/${key}` : key;
//     const params = {
//         Bucket: S3_BUCKET_NAME,
//         Key: finalKey,
//         Body: data,
//         ContentType: contentType,
//     };
//     await awsS3Client.send(new PutObjectCommand(params));
//     const url = `https://${S3_BUCKET_NAME}.s3.${config.get('S3_BUCKET_REGION')}.amazonaws.com/${finalKey}`;
//     return { statusCode: 200, message: "Media file uploaded successfully", url };
// }

// module.exports = { awsS3MediaUploadFunction };

'use strict';

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const config = require('config');

// For Digital Ocean Spaces, you need to add endpoint
const region = config.get('S3_BUCKET_REGION');
const awsS3Client = new S3Client({
    region: region,
    endpoint: `https://${region}.digitaloceanspaces.com`, // Add this line for Digital Ocean
    credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY'),
        secretAccessKey: config.get('S3_SECRET_KEY'),
    },
    forcePathStyle: false, // Add this for Digital Ocean
});

const S3_BUCKET_NAME = config.get('S3_BUCKET_NAME');

async function awsS3MediaUploadFunction({ key, data, contentType, folderName }) {
    if (!key || !data) throw new Error('Key and data are required for upload');
    const finalKey = folderName ? `${folderName}/${key}` : key;
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: finalKey,
        Body: data,
        ContentType: contentType,
        ACL: 'public-read',
    };
    await awsS3Client.send(new PutObjectCommand(params));

    // Change only this line for Digital Ocean Spaces URL format:
    const url = `https://${S3_BUCKET_NAME}.${region}.digitaloceanspaces.com/${finalKey}`;

    return { statusCode: 200, message: "Media file uploaded successfully", url };
}

module.exports = { awsS3MediaUploadFunction };