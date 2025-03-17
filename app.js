const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

app.use(express.json());

// LINE Webhookエンドポイント
app.post("/webhook", async (req, res) => {
    const events = req.body.events;
    
    for (let event of events) {
        if (event.type === "message" && event.message.type === "text") {
            await replyMessage(event.replyToken, `あなたのメッセージ: ${event.message.text}`);
        }
    }
    res.sendStatus(200);
});

// LINEに返信する関数
async function replyMessage(replyToken, text) {
    await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
            replyToken,
            messages: [{ type: "text", text }]
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_ACCESS_TOKEN}`
            }
        }
    );
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
