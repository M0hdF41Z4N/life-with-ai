import Token from '../models/Token.js';
import { oAuth2Client } from '../utils/oauth.js';
import { CLIENT_ID } from '../config/constants.js';
import { errorHandler } from '../utils/errorHandler.js';

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

    // Store the access token, refresh token, and userId in the database
      await Token.findOneAndUpdate(
        { userId },
        { accessToken , refreshToken },
        { upsert: true  }
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