const id = "test/";
const socketURL = "ws://localhost:8080/game/" + id + "ws";


let connect = () => {
  var socket = new WebSocket(socketURL);
  console.log("Attempting Connection...");

  socket.onopen = () => {
    console.log("Successfully Connected");
  };

  socket.onmessage = (msg) => {
    console.log(msg);
  };

  socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
  };

  socket.onerror = (error) => {
    console.log("Socket Error: ", error);
  };
};

export { connect };
