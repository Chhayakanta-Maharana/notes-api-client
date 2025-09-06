const config = {

    MAX_ATTACHMENT_SIZE: 5000000,

    s3: {
        REGION: "us-east-1", // Ensure the region is correct for your S3 bucket
        BUCKET: "notes-app-uploads-chhaya", // Ensure this matches your S3 bucket name
    },
    apiGateway: {
        REGION: "us-east-1", // Ensure the region matches your API Gateway region
        URL: "https://fl7ttsm9fc.execute-api.us-east-1.amazonaws.com/dev", // Ensure this is the correct API Gateway endpoint URL
    },
    cognito: {
        REGION: "us-east-1", // Ensure the region matches your Cognito setup
        USER_POOL_ID: "us-east-1_hmYMQdVVU", // Ensure this is your actual User Pool ID
        APP_CLIENT_ID: "41bglba434ctq4q0ob1urhmk53", // Ensure this is your actual App Client ID
        IDENTITY_POOL_ID: "us-east-1:aaa5d0dc-bec5-4583-b114-107b73745fed", // Ensure this is your actual Identity Pool ID
    },
};

export default config;
