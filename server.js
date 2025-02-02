const express = require('express');
const multer = require('multer');
const OpenAI = require("openai"); // ✅ Correct import for OpenAI v4.x
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Multer config 🪣⚙️
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OpenAI API configuration ⚙️🛠️
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🗝️
});

// API route for image analysis 🔍
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');

    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "What kind of waste is in this photo? Is it industrial, organic, recyclable, hazardous or electronic waste..?"
                  },
                  {
                    type: "image_url",
                    image_url: {
                      "url": `data:image/jpeg;base64,${base64Image}`
                    }
                  }
                ]
            }
        ],
        max_tokens: 300,
    });

    const analysis = response.choices[0].message.content;
    res.json({ result: analysis });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'An error occurred during processing' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
