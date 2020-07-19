var loaddetails;
let connect = () => {
	const id = document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] == 'id')[0][1];
	const socketURL = window.location.href.replace('http', 'ws') + '/' + id + '/ws';

    var socket = new WebSocket(socketURL);
	console.log('Attempting connection to: ' + socketURL);

	socket.onopen = () => {
		console.log('Successfully Connected');
	};

	socket.onclose = (event) => {
        socket.close(1000)
        if (event.code == 1008) {
            alert(event.reason);
            window.Location.href.replace("/game*", "/");
        }
	};
    
	socket.onerror = (error) => {
        console.log('Socket Error: ', error);
	};
	return socket;
	// socket.send

	// socket.addEventListener("/join", () => )

	// const id = document.cookie.split("; ")[0].replace("id=", "");
	// const socketURL =
	//   window.location.href.replace("http://", "ws://") + "/" + id + "/ws";
	// class Sockets {
	//   constructor(socket = new WebSocket(socketURL), ee = new EventEmitter())
};
export { connect, loaddetails };
