var o=require("aws-sdk"),{ethers:t}=require("ethers"),r=new o.S3({apiVersion:"2006-03-01"}),s=["function totalSupply() external view returns (uint256)"],{BUCKET_NAME:c,CONTRACT_ADDRESS:a}=process.env;exports.handler=async i=>{let e=new t.providers.getDefaultProvider,n=await new t.Contract(a,s,e).totalSupply();await r.putObject({Bucket:c,Key:new Date().toISOString()+".txt",Body:n+`
`}).promise()};
//# sourceMappingURL=index.js.map
