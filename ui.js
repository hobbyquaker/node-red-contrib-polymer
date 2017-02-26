var inited = false;
var lastMsg = {};

module.exports = function(RED) {
	if (!inited) {
		inited = true;
		init(RED.server, RED.httpNode || RED.httpAdmin, RED.log, RED.settings);
	}
	
	return { 
		add: add,
		emit: emit,
		toNumber: toNumber.bind(null, false),
		toFloat: toNumber.bind(null, true)
	};
};

var serveStatic = require('serve-static'),
	socketio = require('socket.io'),
	path = require('path'),
	fs = require('fs'),
	events = require('events');

var elements = {};


var io;

var settings = {};

function toNumber(keepDecimals, config, input) {
	if (typeof input === "number")
		return input;

	var inputString = input.toString();
	var nr = keepDecimals ? parseFloat(inputString) : parseInt(inputString);
	return isNaN(nr) ? config.min : nr;
}

function emit(event, data) {
	conole.log('>', event, data);
	io.emit(event, data);
}



/*
options:
	node - the node that represents the control on a flow
	control - the control to be added
	tab - tab config node that this control belongs to
	group - group name
	[emitOnlyNewValues] - boolean (default true). 
		If true, it checks if the payload changed before sending it
		to the front-end. If the payload is the same no message is sent.
	
	[convert] - callback to convert the value before sending it to the front-end
	[convertBack] - callback to convert the message from front-end before sending it to the next connected node
	
	[beforeEmit] - callback to prepare the message that is emitted to the front-end
	[beforeSend] - callback to prepare the message that is sent to the output
    
    [forwardInputMessages] - default true. If true, forwards input messages to the output
    [storeFrontEndInputAsState] - default true. If true, any message received from front-end is stored as state 
*/

var nodes = {};

function add(opt) {

	opt.control.id = opt.node.id;
	var remove = addElement(opt.control);
	
	opt.node.on("input", function (msg) {
		msg.id = opt.node.id;
		if (!elements[msg.id]) elements[msg.id] = {};
		elements[msg.id].lastMsg = msg;
		lastMsg[msg.id] = msg;

		io.emit('input', msg);
	});

    nodes[opt.node.id] = opt.node;

	return function() {
		delete nodes[opt.node.id];
		console.log('remove?');
	};
}

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
	var trimRegex = new RegExp('^\\/|\\/$','g'),
	paths = Array.prototype.slice.call(arguments);
	return '/'+paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}

function init(server, app, log, redSettings) {
	var uiSettings = redSettings.ui || {};
	settings.path = uiSettings.path || 'polymer';
	settings.title = uiSettings.title || 'Node-RED Polymer';
	settings.defaultGroupHeader = uiSettings.defaultGroup || 'Default';
	
	var fullPath = join(redSettings.httpNodeRoot, settings.path);
	var socketIoPath = join(fullPath, 'socket.io');
	io = socketio(server, {path: socketIoPath});

	fs.stat(path.join(__dirname, 'dist/index.html'), function(err, stat) { 
		if (!err) { 
			app.use(join(settings.path), serveStatic(path.join(__dirname, "dist"))); 
		} else {
			log.info("Using development folder");
			app.use(join(settings.path), serveStatic(path.join(__dirname, "src")));
			

		}
	}); 

	log.info("Polymer started at " + fullPath);

	io.on('connection', function (socket) {
		updateElements(socket);

        socket.on('output', function (msg) {
            console.log('output', msg);
            var id = msg.id;
            delete msg.id;
			if (nodes[id]) nodes[id].send(msg);
        });
	});


}

function updateElements() {
	console.log(elements);
	io.emit('elements', elements);
}

function addElement(control) {
	if (typeof control.type !== 'string') return;

	elements[control.id] = control;
    elements[control.id].lastMsg = lastMsg[control.id];

    updateElements();
	
	return function() {



			updateElements();

	}
}

