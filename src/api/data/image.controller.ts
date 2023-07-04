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
// console.log(config)
const s3Client = new S3Client({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  }
});

export const saveImage = async (imageData: Buffer, nombreDelArchivo: string) => {
  const command = new PutObjectCommand({
    Body: imageData,
    Bucket: 'app-base-auth-aws',
    Key: `images/${nombreDelArchivo}`
  });

  try {
    const response = await s3Client.send(command);
    console.log('Imagen guardada exitosamente:', response);
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    throw error;
  }
};
