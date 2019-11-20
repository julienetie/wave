const generateClientScript = (
    serverPort,
    refreshFaviconPath,
    reconnectDelay,
    reconnectTries
) => `
<script>
	const delay = (callback, duration) => {
	    let startTime = 0;
	    let terminate = false;
	    const raf = requestAnimationFrame;
	    const loop = (timestamp) => {
	        startTime = startTime || timestamp;
	        if (timestamp > startTime + duration && !terminate && callback) 
	            return callback(),terminate = true;
	        raf(loop);
	    }
	    raf(loop);
	}
	
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

	let attempts = 0; 
	const connect = () => {
	const socket = new WebSocket('ws://localhost:${serverPort}');
	  socket.onopen = (e) => serverAction(e,socket);

	  socket.onmessage = (e) => serverAction(e,socket);

	  socket.onclose = (e) => {
	    console.info('The server has disconnected. Will attempt to reconnect' + (${reconnectTries} - attempts) + ' times', e.reason);
	    if(document.visibilityState === 'visible'){
		    delay(() => {
		    	if(attempts < ${reconnectTries}){
		      		connect();
		  		}
		  		attempts++;
		    }, ${reconnectDelay});
		}
	  };

	  socket.onerror = (err) => {
	    console.error('There was an error with the connection: ', err.message, 'closing socket');
	    socket.close();
	  };
	}
	connect();
</script>`;

module.exports = generateClientScript;