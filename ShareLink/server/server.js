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



const io = new Server(
  server,
  {
    cors: {
      origin: "*",
    },
  }
);



app.use(cors());

app.use(
  express.json()
);



const DATA_DIR = "./server/data";


if (!fs.existsSync(DATA_DIR)) {

  fs.mkdirSync(
    DATA_DIR,
    {
      recursive: true,
    }
  );

}



const USERS_FILE =
  path.join(
    DATA_DIR,
    "users.json"
  );


const ROOMS_FILE =
  path.join(
    DATA_DIR,
    "rooms.json"
  );


const SIGNALS_FILE =
  path.join(
    DATA_DIR,
    "signals.json"
  );





function loadFile(file) {

  if (!fs.existsSync(file)) {

    fs.writeFileSync(
      file,
      "[]"
    );

  }


  return JSON.parse(
    fs.readFileSync(
      file,
      "utf-8"
    )
  );

}





function saveFile(
  file,
  data
) {

  fs.writeFileSync(
    file,
    JSON.stringify(
      data,
      null,
      2
    )
  );

}





// Health check

app.get(
  "/",
  (req, res) => {

    res.json(
      {
        status:
          "ShareLink backend running",
      }
    );

  }
);





// Register

app.post(
  "/api/register",
  async (
    req,
    res
  ) => {

    const {
      email,
      password,
    } = req.body;



    const users =
      loadFile(
        USERS_FILE
      );



    if (
      users.find(
        (user) =>
          user.email === email
      )
    ) {

      return res.status(400).json(
        {
          error:
            "User already exists",
        }
      );

    }



    const hash =
      await bcrypt.hash(
        password,
        10
      );



    users.push(
      {
        id:
          Date.now(),

        email,

        password:
          hash,
      }
    );



    saveFile(
      USERS_FILE,
      users
    );



    res.json(
      {
        success:
          true,
      }
    );

  }
);





// Login

app.post(
  "/api/login",
  async (
    req,
    res
  ) => {

    const {
      email,
      password,
    } = req.body;



    const users =
      loadFile(
        USERS_FILE
      );



    const user =
      users.find(
        (item) =>
          item.email === email
      );



    if (!user) {

      return res.status(401).json(
        {
          error:
            "Invalid login",
        }
      );

    }



    const valid =
      await bcrypt.compare(
        password,
        user.password
      );



    if (!valid) {

      return res.status(401).json(
        {
          error:
            "Invalid login",
        }
      );

    }



    const token =
      jwt.sign(
        {
          id:
            user.id,

          email:
            user.email,
        },
        JWT_SECRET
      );



    res.json(
      {
        token,

        user:
          {
            id:
              user.id,

            email:
              user.email,
          },
      }
    );

  }
);







// Create room

app.post(
  "/api/rooms",
  (
    req,
    res
  ) => {


    const rooms =
      loadFile(
        ROOMS_FILE
      );



    rooms.push(
      {
        ...req.body,

        created_at:
          Date.now(),
      }
    );



    saveFile(
      ROOMS_FILE,
      rooms
    );



    res.json(
      {
        success:
          true,

        room:
          req.body,
      }
    );

  }
);







// Find room

app.get(
  "/api/rooms",
  (
    req,
    res
  ) => {


    const {
      code,
    } = req.query;



    const rooms =
      loadFile(
        ROOMS_FILE
      );



    const result =
      rooms.filter(
        (room) =>
          room.code === code &&
          room.status === "active"
      );



    res.json(
      result
    );

  }
);







// Create signal message

app.post(
  "/api/signal",
  (
    req,
    res
  ) => {


    const signals =
      loadFile(
        SIGNALS_FILE
      );



    signals.push(
      {
        ...req.body,

        created_date:
          Date.now(),
      }
    );



    saveFile(
      SIGNALS_FILE,
      signals
    );



    res.json(
      {
        success:
          true,
      }
    );

  }
);







// Read signal messages

app.get(
  "/api/signal",
  (
    req,
    res
  ) => {


    const {
      room_code,
      sender,
    } = req.query;



    const signals =
      loadFile(
        SIGNALS_FILE
      );



    const result =
      signals.filter(
        (signal) =>
          signal.room_code === room_code &&
          signal.sender === sender
      );



    res.json(
      result
    );

  }
);







// Socket.IO signaling

io.on(
  "connection",
  (
    socket
  ) => {


    socket.on(
      "join-room",
      (
        room
      ) => {

        socket.join(
          room
        );

      }
    );



    socket.on(
      "signal",
      (
        data
      ) => {

        socket
          .to(
            data.room
          )
          .emit(
            "signal",
            data
          );

      }
    );


  }
);







server.listen(
  PORT,
  () => {

    console.log(
      `ShareLink backend running on http://localhost:${PORT}`
    );

  }
);