// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'yajy4f3wo1'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'uda-pvsm.us.auth0.com',            // Auth0 domain
  clientId: 'qSi8WvRgvjBJ24yXrGmabmxFz46K5G36',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
