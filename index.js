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
console.log("🔹 MONGODB_URI:", process.env.MONGODB_URI);

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

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Un usuario se ha conectado");

  socket.on("joinRoom", (chatRoomId) => {
      socket.join(chatRoomId);
      console.log(`Usuario unido a la sala: ${chatRoomId}`);
  });

  socket.on("mensajePrivado", (data) => {
      console.log("Mensaje privado recibido:", data);
      io.to(data.chatRoomId).emit("mensajePrivado", data); // Enviar solo dentro de la sala
  });

  socket.on("disconnect", () => {
      console.log("🔴 Un usuario se ha desconectado");
  });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Servidor en el puerto ${PORT}`));
