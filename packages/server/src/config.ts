import googleData from '../credentials/google-oauth.json';

const port = Number(process.env.PORT || 4000);
const baseURL = `http://localhost:${port}`;

export default {
  // The secret for the encryption of the jsonwebtoken
  JWTsecret: 'mysecret',
  baseURL,
  port,
  // The credentials and information for OAuth2
  oauth2Credentials: {
    client_id: googleData.clientId,
    project_id: 'Vídeo Maker', // The name of your project
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: googleData.clientSecret,
    redirect_uris: [
      `${baseURL}/auth_callback`
    ],
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  }
};