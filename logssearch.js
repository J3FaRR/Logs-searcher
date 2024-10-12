const TelegramBot = require('node-telegram-bot-api');
const { RipGrep } = require('ripgrep-node');
const fs = require('fs');

const token = 'TOKEN';

const bot = new TelegramBot(token, { polling: true });

function searching(searchquery) {
    let rg = new RipGrep(searchquery, "./files/");
    let data = rg.ignoreCase().maxCount(100).maxDepth(1).noFilename().noMessages().noLineNumber().threads(50);
    let results = data.run().asString();
    if (results) {
        return results;
    } else {
        return false;
    }
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "use /s or /search for searching\nEx. /s gmail");
});

bot.onText(/\/(?:s|search) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const id = msg.from.id;
    if (match[1]) {
        let data = match[1];
        if (data.length <= 2) {
            bot.sendMessage(chatId, "3 or more letters");
            return;
        };
        const results = searching(data);
        if (results) {
            const count = results.split("\n").length;
            const fileName = `${count}.${id}.txt`;
            let caption = `Found ${count} result(s)\n${data}`;
            fs.writeFileSync(fileName, results);
            bot.sendDocument(chatId, fileName, { reply_to_message_id: msg.message_id, caption: caption });
            fs.unlink(fileName, (err) => {
                if (err) throw err});
        } else {
            bot.sendMessage(chatId, `No results for ${data}`);
        }
    } else {
        bot.sendMessage(chatId, "Ex. /s gmail");
    }
});

console.log("started");
