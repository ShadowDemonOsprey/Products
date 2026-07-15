import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const PORT = 3001;
const JWT_SECRET = "sharelink-local-secret";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());


const DATA_DIR = "./server/data";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}


const USERS_FILE = path.join(DATA_DIR, "users.json");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");


function loadFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }

  return JSON.parse(fs.readFileSync(file));
}


function saveFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}


// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ShareLink backend running"
  });
});


// Register
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const users = loadFile(USERS_FILE);

  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      error: "User already exists"
    });
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    email,
    password: hash
  });

  saveFile(USERS_FILE, users);

  res.json({
    success: true
  });
});


// Login
app.post("/api/login", async (req, res) => {

  const { email, password } = req.body;

  const users = loadFile(USERS_FILE);

  const user = users.find(
    u => u.email === email
  );

  if (!user) {
    return res.status(401).json({
      error: "Invalid login"
    });
  }


  const ok = await bcrypt.compare(
    password,
    user.password
  );


  if (!ok) {
    return res.status(401).json({
      error: "Invalid login"
    });
  }


  const token = jwt.sign(
    {
      id: user.id,
      email
    },
    JWT_SECRET
  );


  res.json({
    token,
    user:{
      id:user.id,
      email:user.email
    }
  });

});


// WebRTC signaling
io.on("connection", socket => {

  socket.on("join-room", room => {
    socket.join(room);
  });


  socket.on("signal", data => {

    socket.to(data.room)
      .emit("signal", data);

  });

});


server.listen(PORT, () => {
  console.log(
    `ShareLink backend running on http://localhost:${PORT}`
  );
});