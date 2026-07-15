import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { base44 } from "@/api/base44Client";
import { collectStats } from "@/lib/stats";

const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

const SOCKET_URL = "http://localhost:3001";


export function useViewer(onLog) {

  const [status, setStatus] = useState("idle");
  const [stats, setStats] = useState({
    fps: 0,
    bandwidth: 0,
  });

  const [roomCode, setRoomCode] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);


  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const statsTimerRef = useRef(null);
  const lastStatsRef = useRef(null);

  const codeRef = useRef(null);
  const onLogRef = useRef(onLog);

  onLogRef.current = onLog;



  const sendSignal = useCallback(
    (type, payload) => {

      const socket = socketRef.current;

      const room = codeRef.current;

      if (!socket || !room) {
        return;
      }


      socket.emit(
        "signal",
        {
          room,
          type,
          payload,
        }
      );

    },
    []
  );




  const setupSocket = useCallback(
    (code) => {

      const socket = io(
        SOCKET_URL
      );


      socketRef.current = socket;


      socket.on(
        "connect",
        () => {

          onLogRef.current(
            "Socket connected"
          );


          socket.emit(
            "join-room",
            code
          );

        }
      );



      socket.on(
        "signal",
        async (data) => {

          const pc = pcRef.current;

          if (!pc) {
            return;
          }


          try {

            if (data.type === "sharer-ready") {

              onLogRef.current(
                "Sharer ready"
              );


              sendSignal(
                "ready",
                {}
              );

            }



            if (data.type === "offer") {


              await pc.setRemoteDescription(
                new RTCSessionDescription(
                  data.payload
                )
              );


              const answer =
                await pc.createAnswer();


              await pc.setLocalDescription(
                answer
              );


              sendSignal(
                "answer",
                answer
              );


              onLogRef.current(
                "Answer sent"
              );

            }



            if (data.type === "ice") {

              await pc.addIceCandidate(
                new RTCIceCandidate(
                  data.payload
                )
              );

            }


          }
          catch(err) {

            onLogRef.current(
              "Signal error: " + err.message
            );

          }

        }
      );


    },
    [sendSignal]
  );





  const connect = useCallback(
    async (
      code,
      password
    ) => {


      try {


        const rooms =
          await base44.entities.Room.filter(
            {
              code,
              status:"active"
            }
          );



        if (!rooms.length) {

          onLogRef.current(
            "Room not found"
          );

          setStatus(
            "error"
          );

          return false;
        }



        const hashBuf =
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(password)
          );


        const hash =
          Array.from(
            new Uint8Array(hashBuf)
          )
          .map(
            b =>
            b.toString(16).padStart(2,"0")
          )
          .join("");



        if (
          hash !== rooms[0].password_hash
        ) {

          onLogRef.current(
            "Wrong password"
          );

          setStatus(
            "error"
          );

          return false;

        }



        codeRef.current = code;

        setRoomCode(code);



        const pc =
          new RTCPeerConnection(
            {
              iceServers:
              ICE_SERVERS
            }
          );


        pcRef.current = pc;



        pc.onicecandidate =
          (event)=>{

            if(event.candidate){

              sendSignal(
                "ice",
                event.candidate
              );

            }

          };



        pc.ontrack =
          (event)=>{

            setRemoteStream(
              event.streams[0]
            );


            setStatus(
              "connected"
            );


            onLogRef.current(
              "Screen received"
            );

          };



        setupSocket(
          code
        );



        setStatus(
          "waiting"
        );


        onLogRef.current(
          "Connected. Waiting for sharer..."
        );


        return true;


      }
      catch(err){

        onLogRef.current(
          err.message
        );

        setStatus(
          "error"
        );

        return false;

      }


    },
    [sendSignal, setupSocket]
  );





  const disconnect =
    useCallback(
      ()=>{

        pcRef.current?.close();

        pcRef.current=null;


        socketRef.current?.disconnect();

        socketRef.current=null;


        setRemoteStream(null);

        setRoomCode(null);

        setStatus(
          "idle"
        );


        onLogRef.current(
          "Disconnected"
        );


      },
      []
    );





  useEffect(
    ()=>{

      return ()=>{

        pcRef.current?.close();

        socketRef.current?.disconnect();

      };

    },
    []
  );




  return {

    status,

    stats,

    roomCode,

    remoteStream,

    connect,

    disconnect,

  };

}