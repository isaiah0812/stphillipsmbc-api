const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')
import * as dotenv from 'dotenv';

dotenv.config()

export const checkJwt = auth({
  audience: 'https://spmbc-api/',
  issuerBaseURL: process.env.AUTH0_ISSUER,
})

export const ADMIN_SCOPE = requiredScopes('admin');