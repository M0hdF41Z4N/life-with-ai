import { oAuth2Client } from '../utils/oauth.js';
import { CLIENT_ID } from '../config/constants.js';
import { errorHandler } from '../utils/errorHandler.js';
import { getDB } from '../config/arango.js';

export const googleAuth = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).send('Unable to login! Please try again');
        }
  
      // Get all required tokens using code
      const { tokens } = await oAuth2Client.getToken(code); 
  
      // Extract userId from the ID token 
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token, 
        audience: CLIENT_ID
      });
      const payload = ticket.getPayload();
      const userId = payload.sub; 
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token;

      // Getting Collection
      const db = getDB;
      const Token = db._collection('tokens');

      // Store the access token, refresh token, and userId in the database
      await Token.update(
        { userId: userId }, // Match condition
        { userId: userId, accessToken: accessToken, refreshToken: refreshToken }, // Update data
        { upsert: true } // Enable upsert behavior
      );
    
      return res.status(200).json({ 
        accessToken ,
        refreshToken, 
        userId
      }); 
    } catch (error) {
        errorHandler(res, error, 'Unable to login. Please try again.', 500);
    }
}