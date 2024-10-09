import dotenv from "dotenv";

dotenv.config();

export const getAccessToken = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  grant_type: "client_credentials",
};

export const refreshAccessToken = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  grant_type: "refresh_token"
};
