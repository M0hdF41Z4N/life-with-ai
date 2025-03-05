import dotenv from 'dotenv';
import {google} from "googleapis";
dotenv.config();

export const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET, 
    process.env.REDIRECT_URI 
  );