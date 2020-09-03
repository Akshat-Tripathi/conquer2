var loaddetails;
let connect = (path) => {
	const id = document.cookie.split('; ').map((s) => s.split('=')).filter((arr) => arr[0] === 'id')[0][1];
    const socketURL = window.location.href.replace('http', 'ws').replace("game", path).replace(":3000", "") + '/' + id + '/ws';

	var socket = new WebSocket(socketURL);
	console.log('Attempting connection to: ' + socketURL);

	socket.onopen = () => {
		console.log('Successfully Connected to Websocket');
	};

	socket.onclose = (event) => {
		socket.close(1000);

		if (event.code === 1008) {
			alert(event.reason);
			window.Location.href.replace('/game*', '/');
		}
	};

	socket.onerror = (error) => {
		console.log('Socket Error: ', error);
	};
	return socket;
};

export { connect, loaddetails };
