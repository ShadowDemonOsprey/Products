import { useEffect, useRef } from "react";
import { io } from "socket.io-client";


const SOCKET_URL = "http://localhost:3001";


const socket = io(
  SOCKET_URL,
  {
    autoConnect: false,
  }
);



export function useSignaling(
  roomCode,
  role,
  onMessage
) {

  const cbRef = useRef(onMessage);

  cbRef.current = onMessage;



  useEffect(() => {

    if (!roomCode) {
      return;
    }


    socket.connect();


    socket.emit(
      "join-room",
      roomCode
    );



    const handleSignal = (
      data
    ) => {

      if (
        data.sender !== role
      ) {

        cbRef.current?.(
          data
        );

      }

    };



    socket.on(
      "signal",
      handleSignal
    );



    return () => {

      socket.off(
        "signal",
        handleSignal
      );

      socket.disconnect();

    };


  }, [
    roomCode,
    role
  ]);



  return {
    sendSignal:
      (
        type,
        payload
      ) => {

        socket.emit(
          "signal",
          {
            room:
              roomCode,

            sender:
              role,

            type,

            payload,
          }
        );

      },
  };
}