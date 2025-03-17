const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

module.exports = { getChatGPTReply };
