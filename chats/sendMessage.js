import { AnsweredMessage } from "../MESSAGE.js";

const messageSh = {
  message: {
    text: AnsweredMessage,
  },
  type: "text",
};

export async function sendMessage(user_id, chat_id, current_token) {
  const request = await fetch(
    `https://api.avito.ru/messenger/v1/accounts/${user_id}/chats/${chat_id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + current_token,
      },
      body: JSON.stringify(messageSh),
    }
  ).then((data) => data.json());

  return request;
}
