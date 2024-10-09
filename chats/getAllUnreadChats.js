export async function getAllUnreadChats(current_token, user_id) {
  const request = await fetch(
    `https://api.avito.ru/messenger/v2/accounts/${user_id}/chats?unread_only=true`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + current_token,
      },
    }
  ).then((data) => data.json());

  return request;
}
