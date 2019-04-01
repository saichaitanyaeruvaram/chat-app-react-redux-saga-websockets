import { ADD_MESSAGE, USERS_LIST, ADD_USER } from "../constants/ActionTypes";

let socket;

export const setupSocket = params => {
  socket = new WebSocket("ws://localhost:8989");

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: ADD_USER,
        name: params.username
      })
    );
  };

  return socket;
};

export const sendMessage = params => {
  socket.send(JSON.stringify(params));
};
