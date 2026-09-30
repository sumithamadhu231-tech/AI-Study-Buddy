const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load .env from the SAME server folder
require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check MongoDB URL
if (!process.env.MONGO_URL) {
    console.log("❌ MONGO_URL not found in server/.env");
} else {
    console.log("✅ MONGO_URL loaded successfully");
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB Connected!");
    })
    .catch((err) => {
        console.log("❌ MongoDB Connection Error:", err.message);
    });

// Doubt Schema
const doubtSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Doubt = mongoose.model('Doubt', doubtSchema);

// ASK API
app.post('/api/ask', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || question.trim() === "") {
            return res.status(400).json({ success: false, message: "Please enter a question." });
        }
        const answer = `Your question: "${question}" - This is an important concept. Study it well! Your doubt has been saved successfully in MongoDB.`;
        const newDoubt = new Doubt({ question: question.trim(), answer: answer });
        await newDoubt.save();
        res.status(201).json({ success: true, message: "Question saved successfully!", data: newDoubt });
    } catch (error) {
        console.log("❌ Ask API Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong.", error: error.message });
    }
});

// GET ALL DOUBTS
app.get('/api/doubts', async (req, res) => {
    try {
        const doubts = await Doubt.find().sort({ date: -1 });
        res.json({ success: true, count: doubts.length, data: doubts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to fetch doubts.", error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send("🤖 AI Study Buddy Server Running...");
});

app.listen(5000, () => {
    console.log("🚀 Study Buddy Server is running on port 5000!");
});