const { auth, requiredScopes } = require('express-oauth2-jwt-bearer')
import * as dotenv from 'dotenv';

dotenv.config()

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
})

export const ADMIN_SCOPE = requiredScopes('admin');