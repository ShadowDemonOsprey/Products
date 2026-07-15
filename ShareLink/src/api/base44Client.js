import { io } from "socket.io-client";


const API_URL = "http://localhost:3001";


const socket = io(
  API_URL,
  {
    autoConnect: true,
  }
);



const request = async (
  url,
  options = {}
) => {

  const response =
    await fetch(
      `${API_URL}${url}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },

        ...options,
      }
    );



  const data =
    await response.json();



  if (!response.ok) {

    throw new Error(
      data.error ||
      "Request failed"
    );

  }



  return data;

};





export const base44 = {


  auth: {


    async loginViaEmailPassword(
      email,
      password
    ) {


      const result =
        await request(
          "/api/login",
          {
            method: "POST",

            body: JSON.stringify({
              email,
              password,
            }),

          }
        );



      localStorage.setItem(
        "sharelink_token",
        result.token
      );



      localStorage.setItem(
        "sharelink_user",
        JSON.stringify(
          result.user
        )
      );



      return result;

    },





    async register(data) {

      return request(
        "/api/register",
        {
          method: "POST",

          body: JSON.stringify(
            data
          ),
        }
      );

    },





    async me() {


      const user =
        localStorage.getItem(
          "sharelink_user"
        );



      if (!user) {

        throw new Error(
          "Not logged in"
        );

      }



      return JSON.parse(
        user
      );

    },





    logout() {


      localStorage.removeItem(
        "sharelink_token"
      );


      localStorage.removeItem(
        "sharelink_user"
      );


      window.location.href =
        "/login";

    },





    loginWithProvider() {

      alert(
        "Google login is not configured yet"
      );

    },


  },







  entities: {


    Room: {


      async create(data) {

        return request(
          "/api/rooms",
          {
            method: "POST",

            body: JSON.stringify(
              data
            ),
          }
        );

      },





      async filter(data) {

        return request(
          `/api/rooms?code=${data.code}`
        );

      },





      async updateMany() {

        return true;

      },


    },









    SignalMessage: {


      async create(data) {


        socket.emit(
          "signal",
          {
            room:
              data.room_code,

            data,

          }
        );



        return request(
          "/api/signal",
          {
            method: "POST",

            body:
              JSON.stringify(
                data
              ),
          }
        );


      },





      async filter(data) {


        return request(
          `/api/signal?room_code=${data.room_code}&sender=${data.sender}`
        );


      },







      async deleteMany() {

        return true;

      },







      subscribe(callback) {


        const handler =
          (message) => {


            if (
              message?.data
            ) {

              callback(
                {
                  type: "create",

                  data:
                    message.data,

                }
              );

            }


          };



        socket.on(
          "signal",
          handler
        );



        return () => {

          socket.off(
            "signal",
            handler
          );

        };

      },


    },


  },


};