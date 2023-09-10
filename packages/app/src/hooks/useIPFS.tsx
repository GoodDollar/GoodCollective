// export default function useIPFS() {
//   const FormData = require('form-data');
//   const axios = require('axios');
//   // const pinata = pinataSDK(process.env.NEXT_PUBLIC_PINATA_API_KEY, process.env.NEXT_PUBLIC_PINATA_SECRET_KEY)
//   const { image, name, description, setIpfsCid } = useMetadataContext();
//   const { mint } = useFayreContracts();

//   const uploadMetadata = async (mintObj: any) => {
//     const data = new FormData();
//     let imageCID: string;
//     console.log('hits');

//     try {
//       const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
//       console.log(image, 'line 24 ipfs');
//       data.append('file', image);
//       const uplaodImage = await axios.post(url, data, {
//         maxBodyLength: 'Infinity',
//         headers: {
//           pinata_api_key: '470f87aa78c6c163afb8',
//           pinata_secret_api_key: 'a3d7d463e4ba53ceebea81aec98a02e259882cd79bf14c4f18cdc98e20a2ea44',
//         },
//       });
//       return (
//         console.log('fires'),
//         console.log(uplaodImage.data.IpfsHash as string),
//         (imageCID = uplaodImage.data.IpfsHash as string),
//         uploadData(mintObj, imageCID)
//       );
//     } catch (err: any) {
//       console.error(err, 'error uploading image');
//     }
//   };

//   const uploadData = async (mintObj: any, imageCID: string) => {
//     const metadataObj = {
//       description: description,
//       image: imageCID,
//       name: name,
//     };

//     try {
//       const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

//       const uploadData = await axios.post(url, metadataObj, {
//         maxBodyLength: 'Infinity',
//         headers: {
//           pinata_api_key: process.env.NEXT_PUBLIC_PINATA_PUBLIC_KEY,
//           pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
//         },
//       });
//       return (
//         console.log(uploadData.data.IpfsHash as string),
//         await mint(
//           mintObj.tokenStandard,
//           uploadData.data.IpfsHash as string,
//           mintObj.amount,
//           mintObj.royalties,
//           mintObj.collectionName
//         )
//       );
//     } catch (err) {
//       console.error(err, 'error uploading metadata');
//     }
//   };

//   return { uploadMetadata };
// }
