import express from "express";
import morgan from "morgan";
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
const app = express();
const bot_tg = new TelegramBot(process.env.API_KEY_BOT, {
  polling: {
    interval: 200,
    autoStart: true,
  },
});

async function main() {
  app.use(morgan("tiny"));
  bot_tg.on("polling_error", (err) => console.log(err.data.error.message));
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);

  const unreadChatsId = [];
  const answeredChatsId = [];
  const messageChatsId = new Set();
  let isWorking = true;

  bot_tg.on("text", async (msg) => {
    if (msg.text === "/start") {
      await bot_tg.sendMessage(msg.chat.id, "Активен");
      messageChatsId.add(msg.chat.id);
      interval.make(bot, 3000)
    }
    if (msg.text === "/stop") {
      await bot_tg.sendMessage(msg.chat.id, "Выключен");
      isWorking = false;
      interval.clearAll()
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
        unreadChatsId.push(el.id);
      });
    }

    unreadChatsId.forEach(async (el) => {
      if (contains(answeredChatsId, el) !== el) {
        await sendMessage(process.env.USER_ID, el, current_token);
        answeredChatsId.push(el);
        unreadChatsId.remove(el);

        const messageFromUser = chats.find((i) => {
          return i.id === el;
        });

        messageChatsId.forEach(async (id) => {
          await bot_tg.sendMessage(
            id,
            messageFromUser.last_message.content.text
          );
        });
      }
    });
  };

}

main();
