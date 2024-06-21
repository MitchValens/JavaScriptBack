const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Configuración
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/JavaScriptBack';

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a la base de datos MongoDB');
});

// Definición del esquema y modelo con Mongoose
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  developer: { type: String, required: true },
  description: { type: String, required: true }
});

const Game = mongoose.model('Game', GameSchema);



// Ruta para el chatbot
app.post('/api/chatbot', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 50
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    res.json({ text: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error al hacer la solicitud al chatbot:', error);
    res.status(500).json({ error: 'Error al comunicarse con OpenAI' });
  }
});

// Ruta para crear un juego en MongoDB
app.post('/api/games', async (req, res) => {
  const { title, genre, releaseDate, developer, description } = req.body;

  const newGame = new Game({
    title,
    genre,
    releaseDate,
    developer,
    description
  });

  try {
    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    console.error('Error al guardar el juego en MongoDB:', error);
    res.status(400).json({ error: 'Error al guardar el juego en la base de datos' });
  }
});

// Ruta para obtener todos los videojuegos
app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    console.error('Error al obtener los videojuegos:', error);
    res.status(500).json({ error: 'Error al obtener los videojuegos' });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
