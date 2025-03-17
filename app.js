const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

// JSON パーサーを適用
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));

// LINE Webhookエンドポイント
app.post("/webhook", async (req, res) => {
    try {
        console.log("🚀 Webhook received - Full request:", JSON.stringify(req.body, null, 2));

        // リクエストデータが空の場合、400エラーを返す
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error("❌ Error: Empty request body - Bad Request");
            return res.status(400).send("Bad Request: Empty body");
        }

        // `events` フィールドが存在するか確認
        if (!req.body.events) {
            console.error("❌ Error: Missing 'events' field - Bad Request");
            return res.status(400).send("Bad Request: Missing 'events' field");
        }

        const events = req.body.events;
        for (let event of events) {
            if (event.type === "message" && event.message.type === "text") {
                await replyMessage(event.replyToken, event.message.text);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error in /webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});

// LINEに返信する関数
async function replyMessage(replyToken, text) {
    try {
        console.log(`📤 Sending reply: ${text}`);

        const response = await axios.post(
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

        console.log("✅ Message sent:", response.data);
    } catch (error) {
        console.error("❌ Error sending message:", error.response?.data || error.message);
    }
}

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
