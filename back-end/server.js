const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

app.use(cors())
app.use(express.json())

// Import Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai')
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "You are a teacher who helps to learn how to prompt and to be a good prompt engineer",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 200,
    responseMimeType: "text/plain",
};

// Store chat sessions (history) in memory
const chatSessions = {};

const PORT = process.env.PORT || 5000

async function run(req, sessionId) {
    // Check if the session exists, otherwise create a new one
    if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        { text: "Greet the user, and ask them an example of a prompt, after getting that prompt analyze it give them a score on 1 to 10. After that give them a better prompt version of the example. Then tell them how they can improve their prompting" }
                    ]
                }
            ],
        });
    }

    const chatSession = chatSessions[sessionId];

    // Send user's message to the chat session
    const result = await chatSession.sendMessage(req.body.userMessage);

    console.log(`Chat History for ${sessionId}:`, JSON.stringify(chatSession.getHistory(), null, 2));

    return result.response.text();
}

app.post('/chat', async (req, res) => {
    const sessionId = req.body.sessionId || "default"; // Use sessionId to track conversations
    const botResponse = await run(req, sessionId);
    res.status(200).json({ botMessage: botResponse });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});
