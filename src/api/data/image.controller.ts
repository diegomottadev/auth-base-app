import AWS from 'aws-sdk';
import config from './../../api/config';
console.log(config)


const s3Cliente = new AWS.S3({
  region: config.s3.region,
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  
});
s3Cliente.listBuckets((err, data) => {
  if (err) {
    console.log("Error al listar los buckets de S3:", err);
  } else {
    console.log("Buckets de S3:", data.Buckets);
  }
});
export const saveImage = (imageData: Buffer, nombreDelArchivo: string) => {
  return s3Cliente.putObject({
    Body: imageData,
    Bucket: 'app-base-auth-aws',
    Key: `images/${nombreDelArchivo}`
  }).promise();
};
