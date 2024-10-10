import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import getToken from "./autorization/getToken.js";
import { getAllUnreadChats } from "./chats/getAllUnreadChats.js";
import { sendMessage } from "./chats/sendMessage.js";

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

function contains(arr, elem) {
  return arr.find((i) => i === elem) != -1;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let interval = {
  // to keep a reference to all the intervals
  intervals: new Set(),

  // create another interval
  make(...args) {
    var newInterval = setInterval(...args);
    this.intervals.add(newInterval);
    return newInterval;
  },

  // clear a single interval
  clear(id) {
    this.intervals.delete(id);
    return clearInterval(id);
  },

  // clear all intervals
  clearAll() {
    for (var id of this.intervals) {
      this.clear(id);
    }
  },
};

dotenv.config();
const bot_tg = new TelegramBot(process.env.API_KEY_BOT, {
  polling: {
    interval: 200,
    autoStart: true,
  },
});

async function main() {
  bot_tg.on("polling_error", (err) => console.log(err.data.error.message));
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);

  const unreadChatsId = new Set();
  const answeredChatsId = new Set();
  const messageChatsId = new Set();
  let isWorking = true;
  let userInterval = process.env.INTERVAL;

  bot_tg.on("text", async (msg) => {
    if (msg.text === "/start") {
      await bot_tg.sendMessage(
        msg.chat.id,
        "Авито Автоответы v1.0.0\n\nТех.поддержка: @GMTUSDT"
      );
    }
    if (msg.text === "/add") {
      messageChatsId.add(msg.chat.id);
      isWorking = true;
      messageChatsId.forEach(async (id) => {
        await bot_tg.sendMessage(id, "Активен");
      });

      interval.make(bot, userInterval);
    }
    if (msg.text === "/stop") {
      messageChatsId.forEach(async (id) => {
        await bot_tg.sendMessage(id, "Выключен");
      });
      isWorking = false;
      interval.clearAll();
    }
    if (msg.text === "/status") {
      let messageString = "Текущий статус автоответчика: ";
      messageString += isWorking ? "Работает" : "Не работает";
      messageString += `\n\n${messageChatsId.size} пользователей в подписке.`;
      await bot_tg.sendMessage(msg.chat.id, messageString);
    }
    if (msg.text === "/add_user") {
      await bot_tg.sendMessage(
        msg.chat.id,
        "Вы добавлены в рассылку. \n\nПроверьте статус работы автоответчика."
      );
      messageChatsId.add(msg.chat.id);
    }
  });

  const bot = async () => {
    let current_token = await getToken();

    let chats = await getAllUnreadChats(
      current_token,
      process.env.USER_ID
    ).then((data) => data.chats);

    if (chats.length >= 1) {
      chats.forEach((el) => {
        unreadChatsId.add(el.id);
      });
    }

    unreadChatsId.forEach(async (el) => {
      if (!answeredChatsId.has(el)) {
        await sendMessage(process.env.USER_ID, el, current_token);
        answeredChatsId.add(el);
        unreadChatsId.delete(el);

        const messageFromUser = chats.find((i) => {
          return i.id === el;
        });

        let messageStr = "🟢 Новый клиент";
        messageStr += `\n\nСообщение:`;
        messageStr += `\n${messageFromUser.last_message.content.text}`;

        messageChatsId.forEach(async (id) => {
          await bot_tg.sendMessage(id, messageStr);
        });
      }
    });
  };
}

main();
