import { getAccessToken } from "../request_params.js";

export default async function getToken() {
  const request = await fetch("https://api.avito.ru/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(getAccessToken),
    json: true,
  }).then((data) => data.json());

  return request.access_token
}

export async function refreshToken(current_token) {

    let params = new URLSearchParams(getAccessToken) 
    params.append('refresh_token', `${current_token}`)

    const request = await fetch("https://api.avito.ru/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      json: true,
    }).then((data) => data.json());
  
    return request
  }
