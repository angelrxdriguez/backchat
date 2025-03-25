require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let collection;

async function connectToDB() {
  try {
    await client.connect();
    collection = client.db('chat').collection('usuarios');
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
  }
}
connectToDB();

// Rutas
app.get('/api', (req, res) => res.json({ message: 'Bienvenido a la API' }));

app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await collection.find({}, { projection: { email: 1 } }).toArray();
    res.json({ success: true, usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en ejecución en el puerto ${PORT}`));
