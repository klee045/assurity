# assurity

## Description

This is a Node.js application that queries the **Microsoft Graph API** for security group information, stores the data in a **MongoDB** database, and can be containerized using **Docker**.

---

## Features

- Authenticates with Microsoft Graph API using OAuth2 client credentials.
- Queries and retrieves **security group** information from Microsoft Graph API.
- Stores retrieved security group data in a **MongoDB** database.

---

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js**
- **Docker**

Additionally, you'll need the following credentials from [Azure](https://learn.microsoft.com/en-us/graph/auth-v2-service) to interact with Microsoft Graph API:

- **CLIENT_ID**: Your registered Azure Application's client ID.
- **CLIENT_SECRET**: Your registered Azure Application's client secret.
- **TENANT_ID**: Your Azure tenant ID.

---

## Docker Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/klee045/assurity.git
cd assurity
```

### Step 2: Build the image

```bash
docker build -t <name:tag> .
```

### Step 3: Update image name and tag in docker-compose.yml

```
...
assurity:
    image: <name>:<tag>
...
```

### Step 4: Retrieve Tenant ID, Client ID and Client Secret from Azure and update docker-compose.yml

[Register your app](https://learn.microsoft.com/en-us/graph/auth-register-app-v2) and retrieve the relevant details. Then, update `docker-compose.yml`

```
...
assurity:
...
    environment:
        ...
        TENANT_ID: <tenant_id>
        CLIENT_ID: <client_id>
        CLIENT_SECRET: <client_secret>
```

### Step 5: Docker run or Docker compose

#### Run docker-compose.yml

```bash
docker compose -f docker-compose.yml run -d
```

#### OR

#### If running just the app's Docker container

```bash
docker run \
-p <HOST_PORT>:<CONTAINER_PORT> \
-e TENANT_ID=<tenant_id> \
-e CLIENT_ID=<client_id> \
-e CLIENT_SECRET=<client_secret> \
-e MONGODB_CONNECTION_STRING=<mongodb_cn_str> \
--name <name_of_container> \
-d <name>:tag>
```

Do ensure that you have MongoDB running either on cloud or on-premise and its connection string can be provided above.

## Development Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/klee045/assurity.git
cd assurity
```

### Step 2: Create .env with updated values from sample.env

```
...
TENANT_ID: <tenant_id>
CLIENT_ID: <client_id>
CLIENT_SECRET: <client_secret>
...
```

### Step 3: Run dev command while in same directory as package.json

```bash
npm run dev
```

### Step 4: Test the app

```bash
npm test
```

---

## Extra Notes

- An **assumption** that I have is `Security Groups` refer to the subset under `Group` where `securityEnabled: true` and `mailEnabled: false` and NOT `Network Security Groups (NSG)` or `Application Security Groups (ASG)`

- This backend service is designed to be a **daemon app**, without a user hence it is obtaining tokens via [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow)

- Being a daemon app, there will unlikely be any user interaction so **admin consent has to be given manually**

  - unable to use a redirect endpoint for admin users to grant consent as part of the flow as this assumes there is an interface available to do redirects and callbacks
  - if there is an interface available, it will then mean there will be users involved and so it will no longer be just a daemon app and the [OAuth 2.0 code grant](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) should be used instead

- It might also be possible that retrieval of Security Group information might be a cron job of some sort, which also indicates that the app will be headless with no interface.

- The current method of storing secrets and IDs in `.env` is definitely not ideal and secure but this direction was chosen to cut down on overhead trying to find a suitable self-hostable solution

  - with time, **other more secure storage options should be explored**: `AWS Secrets Manager`, `Azure Key Vault`

- The endpoint is named `/group/security/sync` because Security Groups are a subset of Groups and in the future, endpoints related to Groups might be implemented

- I have also implemented `createIfNotExistsSecurityGroup` alongside `upsertSecurityGroup` because I am unsure if there are any use cases that require only the creation of new security groups but not updating existing ones despite possible changes
  - `upsert` seems more likely to me so the **main implementation was upsert**
