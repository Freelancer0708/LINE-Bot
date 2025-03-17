const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));

// ChatGPT API を呼び出す関数
async function getChatGPTReply(userMessage) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo", // または "gpt-4"
                messages: [{ role: "user", content: userMessage }],
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ Error in ChatGPT API:", error.response?.data || error.message);
        return "申し訳ありません。現在AIが応答できません。";
    }
}

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
                const userMessage = event.message.text;
                const chatGPTResponse = await getChatGPTReply(userMessage); // ChatGPTにメッセージを送信

                await replyMessage(event.replyToken, chatGPTResponse); // ChatGPTの応答をLINEに送信
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

        console.log("✅ Message sent successfully");
    } catch (error) {
        console.error("❌ Error sending message:", error.response?.data || error.message);
    }
}

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
