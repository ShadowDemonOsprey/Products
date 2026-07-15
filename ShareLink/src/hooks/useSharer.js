import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { apiPost } from "@/lib/api";


const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];


const SOCKET_URL = "http://localhost:3001";


export function useSharer(onLog) {

  const [status, setStatus] = useState("idle");

  const [stats] = useState({
    fps: 0,
    bandwidth: 0,
  });

  const [roomCode, setRoomCode] = useState(null);

  const [localStream, setLocalStream] = useState(null);


  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const codeRef = useRef(null);

  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;



  const sendSignal = useCallback(
    (type, payload) => {

      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        onLogRef.current(
          "Socket not connected"
        );
        return;
      }


      socket.emit(
        "signal",
        {
          room: codeRef.current,
          sender: "sharer",
          type,
          payload,
        }
      );


      onLogRef.current(
        "Signal sent: " + type
      );

    },
    []
  );





  const connectSocket = useCallback(
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


          onLogRef.current(
            "Joined room " + code
          );

        }
      );





      socket.on(
        "signal",
        async(data) => {


          if(
            data.sender === "sharer"
          ){
            return;
          }



          const pc =
            pcRef.current;


          if(!pc){
            return;
          }




          try {



            if(
              data.type === "viewer-ready"
            ){


              onLogRef.current(
                "Viewer joined"
              );


              const offer =
                await pc.createOffer();



              await pc.setLocalDescription(
                offer
              );



              sendSignal(
                "offer",
                offer
              );


            }






            if(
              data.type === "answer"
            ){


              await pc.setRemoteDescription(
                new RTCSessionDescription(
                  data.payload
                )
              );


              onLogRef.current(
                "Answer received"
              );


            }







            if(
              data.type === "ice"
            ){


              await pc.addIceCandidate(
                new RTCIceCandidate(
                  data.payload
                )
              );


            }




          }
          catch(err){

            onLogRef.current(
              "Signal error: " + err.message
            );

          }


        }
      );


    },
    [
      sendSignal
    ]
  );







  const createRoom =
    useCallback(
      async(password)=>{


        const code =
          Math.random()
          .toString(36)
          .substring(2,8)
          .toUpperCase();




        const hashBuffer =
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder()
            .encode(password)
          );



        const hash =
          Array.from(
            new Uint8Array(hashBuffer)
          )
          .map(
            b =>
            b.toString(16)
            .padStart(2,"0")
          )
          .join("");




        await apiPost(
          "/api/rooms",
          {
            code,
            password_hash: hash,
            status:"active",
          }
        );



        codeRef.current = code;

        setRoomCode(code);



        connectSocket(
          code
        );


        onLogRef.current(
          "Room created: " + code
        );


      },
      [
        connectSocket
      ]
    );







  const startSharing =
    useCallback(
      async(settings)=>{


        const stream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video:{
                frameRate:{
                  ideal:
                  settings?.fps || 30
                }
              },
              audio:false,
            }
          );



        streamRef.current = stream;

        setLocalStream(stream);





        const pc =
          new RTCPeerConnection(
            {
              iceServers:
              ICE_SERVERS
            }
          );



        pcRef.current = pc;




        stream.getTracks()
        .forEach(
          track =>
            pc.addTrack(
              track,
              stream
            )
        );





        pc.onicecandidate =
          event => {

            if(
              event.candidate
            ){

              sendSignal(
                "ice",
                event.candidate
              );

            }

          };





        pc.onconnectionstatechange =
          () => {

            onLogRef.current(
              "Connection: " +
              pc.connectionState
            );

          };




        setStatus(
          "waiting"
        );


        onLogRef.current(
          "Screen capture started"
        );



      },
      [
        sendSignal
      ]
    );








  const stopSharing =
    useCallback(
      ()=>{


        streamRef.current
        ?.getTracks()
        .forEach(
          t=>t.stop()
        );


        pcRef.current?.close();


        pcRef.current = null;


        setLocalStream(null);

        setStatus(
          "idle"
        );


      },
      []
    );







  const disconnect =
    useCallback(
      ()=>{


        stopSharing();


        socketRef.current?.disconnect();


        socketRef.current=null;


        setRoomCode(null);


      },
      [
        stopSharing
      ]
    );








  useEffect(
    ()=>{


      return ()=>{


        socketRef.current?.disconnect();

        stopSharing();


      };


    },
    [
      stopSharing
    ]
  );







  return {

    status,

    stats,

    roomCode,

    localStream,

    createRoom,

    startSharing,

    stopSharing,

    disconnect,

  };


}