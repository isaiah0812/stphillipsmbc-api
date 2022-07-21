const { auth } = require('express-oauth2-jwt-bearer')

export const checkJwt = auth({
  audience: 'https://spmbc-api/',
  issuerBaseURL: `https://spmbc-dev.us.auth0.com/`,
})