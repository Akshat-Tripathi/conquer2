/*const id = "test/";
const socketURL = "ws://localhost:8080/game/" + id + "ws";*/

let connect = () => {
  const id = document.cookie.split("; ")[0].replace("id=", "");
  const socketURL = window.location.href.replace("http://", "ws://") + "/" + id + "/ws";
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
    alert("Invalid login");
    window.location.replace(window.location.href.replace("/game", ""));
  };

  socket.onerror = (error) => {
    console.log("Socket Error: ", error);
  };
};

export { connect };
