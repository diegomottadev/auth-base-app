/*

AWS SDK for JavaScript (v2).

*/

// import AWS from 'aws-sdk';
// import config from './../../api/config';

// const s3Cliente = new AWS.S3({
//   region: config.s3.region,
//     accessKeyId: config.s3.accessKeyId,
//     secretAccessKey: config.s3.secretAccessKey
// });
// s3Cliente.listBuckets((err, data) => {
//   if (err) {
//     console.log("Error al listar los buckets de S3:", err);
//   } else {
//     console.log("Buckets de S3:", data.Buckets);
//   }
// });
// export const saveImage = (imageData: Buffer, nombreDelArchivo: string) => {
//   return s3Cliente.putObject({
//     Body: imageData,
//     Bucket: 'app-base-auth-aws',
//     Key: `images/${nombreDelArchivo}`
//   }).promise();
// };


/*

AWS SDK for JavaScript (v3).

*/
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import config from './../../api/config';

// Create an instance of the S3 client with the provided region and credentials
const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  }
});

// Function to save an image to S3
export const saveImage = async (imageData: Buffer, nombreDelArchivo: string) => {
  // Create a PutObjectCommand with the image data, bucket name, and object key
  const command = new PutObjectCommand({
    Body: imageData,
    Bucket: 'app-base-auth-aws',
    Key: `images/${nombreDelArchivo}`
  });

  try {
    // Send the command to upload the image to S3 and await the response
    const response = await s3Client.send(command);
    console.log('Image saved successfully:', response);
  } catch (error) {
    console.error('Error saving the image:', error);
    throw error;
  }
};

