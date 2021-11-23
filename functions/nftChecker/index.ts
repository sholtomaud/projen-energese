const aws = require("aws-sdk");
const { ethers } = require("ethers");

const s3 = new aws.S3({ apiVersion: "2006-03-01" });
const contractAbi = ["function totalSupply() external view returns (uint256)"];

const { BUCKET_NAME, CONTRACT_ADDRESS } = process.env;

exports.handler = async (event) => {
    const provider = new ethers.providers.getDefaultProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
    const mintedTokens = await contract.totalSupply();

    await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: new Date().toISOString() + ".txt",
        Body: mintedTokens + "\n",
    }).promise();

};