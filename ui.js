var serveStatic = 	require('serve-static');
var	socketio = 		require('socket.io');
var	path = 			require('path');
var	fs = 			require('fs');
var	events = 		require('events');

var inited = false;
var lastMsg = {};
var settings = {};
var nodes = {};

var sites = {};
var pages = {};
var groups = {};
var elements = {};

var io;

module.exports = function (RED) {
	if (!inited) {
		inited = true;
		init(RED);
	}
	return { 
		add: add
	};
};


function add(opt) {
	opt.control.id = opt.node.id;
	var remove = addElement(opt.control);

	opt.node.on("input", function (msg) {
		msg.id = opt.node.id;
		//if (!elements[msg.id]) elements[msg.id] = {};
		if (elements[msg.id]) elements[msg.id].lastMsg = msg;
		if (groups[msg.id]) groups[msg.id].lastMsg = msg;
		if (pages[msg.id]) pages[msg.id].lastMsg = msg;
		if (sites[msg.id]) sites[msg.id].lastMsg = msg;
		lastMsg[msg.id] = msg;

		io.emit('input', msg);
	});

	opt.node.on('close', function () {
		remove();
	});

    nodes[opt.node.id] = opt.node;

	return function () {
		remove();
		delete nodes[opt.node.id];
	};
}

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
	var trimRegex = new RegExp('^\\/|\\/$','g'),
	paths = Array.prototype.slice.call(arguments);
	return '/'+paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}


function init(RED) {
	var server = RED.server;
	var app = RED.httpNode || RED.httpAdmin;
	var log = RED.log;
	var redSettings = RED.settings;

    var uiSettings = redSettings.ui || {};
	settings.path = uiSettings.path || 'polymer';
	settings.title = uiSettings.title || 'Node-RED Polymer';
	settings.defaultGroupHeader = uiSettings.defaultGroup || 'Default';
	
	var fullPath = join(redSettings.httpNodeRoot, settings.path);
	var socketIoPath = join(fullPath, 'socket.io');
	io = socketio(server, {path: socketIoPath});


	app.get(join(settings.path) + '/elements/custom_template.html', function (req, res) {
        var tplConfig = elements[req.query.node];

		var template = '<dom-module id="node-red-template-' + tplConfig.id + '">\n' +
			'<template><div>\n' +
				tplConfig.html + '\n' +
			'</div></template>\n' +
			'<script>\n' +
			'Polymer({\n' +
			'is: "node-red-template-' + tplConfig.id + '"\n' +
			'})\n' +
			'</script>\n' +
			'</dom-module>\n';

		res.send(template);
	});

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
		update(socket);
        socket.on('output', function (msg) {
            var id = msg.id;
            delete msg.id;
			if (nodes[id]) nodes[id].send(msg);
        });
	});

	io.on('connect_error', function (error) {
		console.log('connect_error', error);
	});
}


function update(sock) {
	(sock ? sock : io).emit('update', {
		sites: sites,
		pages: pages,
		groups: groups,
		elements: elements
	});
}


function addElement(control) {
	if (typeof control.type !== 'string') return;

    if (lastMsg[control.id]) control.lastMsg = lastMsg[control.id];

    if (control.type === 'polymer_nav_site') {
        sites[control.id] = control;
    } else if (control.type === 'polymer_nav_page') {
        pages[control.id] = control;
    } else if (control.type.indexOf('polymer_nav_group') === 0) {
        groups[control.id] = control;
    } else {
    	elements[control.id] = control;
   	}
   	update();

	return function () {
        delete nodes[control.id];
        if (control.type === 'polymer_nav_site') {
            delete sites[control.id];
        } else if (control.type === 'polymer_nav_page') {
            delete pages[control.id];
        } else if (control.type.indexOf('polymer_nav_group') === 0) {
            delete groups[control.id];
        } else {
            delete elements[control.id];
        }
        update();
	}
}
