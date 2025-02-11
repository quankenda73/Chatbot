const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // N?p các bi?n môi tru?ng t? file .env

const app = express();
const port = process.env.PORT || 3000;

// C?u hình Multer d? x? lý t?i ?nh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Luu ?nh vào thu m?c uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ð?t tên file theo th?i gian
  }
});
const upload = multer({ storage });

// Middleware d? parse JSON
app.use(bodyParser.json());
// Ph?c v? các t?p tinh t? thu m?c "public"
app.use(express.static('public'));
// Ph?c v? các t?p t?i lên t? thu m?c "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint x? lý chat (g?i API ChatGPT thông qua backend)
app.post('/chat', async (req, res) => {
  const userInput = req.body.message;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userInput }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const botReply = response.data.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ reply: 'L?i khi g?i API.' });
  }
});

// Endpoint x? lý t?i ?nh lên
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có ?nh nào du?c t?i lên.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Kh?i d?ng server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
