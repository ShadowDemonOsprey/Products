const API_URL =
  "http://localhost:3001";


export async function apiPost(
  endpoint,
  data
){

  const response =
    await fetch(
      API_URL + endpoint,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:
          JSON.stringify(data),
      }
    );


  return response.json();

}



export async function apiGet(
  endpoint
){

  const response =
    await fetch(
      API_URL + endpoint
    );


  return response.json();

}