const generateClientScript = (serverPort, refreshFaviconPath) => `<script>
	const serverAction = (e, socket) => {
			favicon.href = '${refreshFaviconPath}';
			document.title = 'Updating';
			const payload = JSON.stringify({
				visibilityState: document.visibilityState,
				timestamp: Date.now(), 
				devicePixelRatio
			});	
			socket.send(payload);
			Function(e.data)();
		}
	const connect = () => {
	const socket = new WebSocket('ws://localhost:${serverPort}');
	  socket.onopen = (e) => serverAction(e,socket);

	  socket.onmessage = (e) => serverAction(e,socket);

	  socket.onclose = (e) => {
	    console.info('The server has disconnected. Will attempt to reconnect in 2 seconds', e.reason);
	    setTimeout(function() {
	      connect();
	    }, 2000);
	  };

	  socket.onerror = function(err) {
	    console.error('There was an error with the connection: ', err.message, 'closing socket');
	    socket.close();
	  };
	}
	connect();
</script>`;

module.exports = generateClientScript;

