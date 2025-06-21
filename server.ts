import { app } from "./app";
import { getAzureAccessToken } from "./auth/auth";

const port = process.env.PORT;

app.listen(port, () => {
  getAzureAccessToken(); // initialize Azure Access Token for Microsoft Graph API usage on app start

  console.log(`Example app listening on port ${port}`);
});
