const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // N?p c�c bi?n m�i tru?ng t? file .env

const app = express();
const port = process.env.PORT || 3000;

// C?u h�nh Multer d? x? l� t?i ?nh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Luu ?nh v�o thu m?c uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // �?t t�n file theo th?i gian
  }
});
const upload = multer({ storage });

// Middleware d? parse JSON
app.use(bodyParser.json());
// Ph?c v? c�c t?p tinh t? thu m?c "public"
app.use(express.static('public'));
// Ph?c v? c�c t?p t?i l�n t? thu m?c "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint x? l� chat (g?i API ChatGPT th�ng qua backend)
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

// Endpoint x? l� t?i ?nh l�n
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Kh�ng c� ?nh n�o du?c t?i l�n.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Kh?i d?ng server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
