
window.addEventListener('WebComponentsReady', function(e) {
    console.log('components ready');
    var socket = io({path: location.pathname + 'socket.io'});
    socket.on('connect', function(){
        console.log('connect');
    });
    socket.on('event', function(data){
        console.log('event', data);
        socket.emit('ui-replay-state');
    });
    socket.on('disconnect', function(){});

    var elements = {};
    socket.on('elements', function (data) {
        elements = data;
        console.log('elements', data);
        var container = document.querySelector('#container');
        container.innerHTML = '';

        Object.keys(data).forEach(function (id) {
            var elem = data[id];
            console.log(elem);
            var customElement = document.createElement(elem.element);

            customElement.setAttribute('id', elem.id);

            if (elem.html) {
                var newContent = document.createTextNode(elem.html);
                customElement.appendChild(newContent);
            }

            try {
                var attrs = JSON.parse(elem.attributes);
                Object.keys(attrs).forEach(function (attr) {
                    customElement.setAttribute(attr, attrs[attr]);
                });
            } catch (e) {}


            var tmp = elem.event.split(':');
            console.log('event', tmp);
            customElement.addEventListener(tmp[0], function (data) {
                var msg = {id: id, payload: customElement[tmp[1]]};
                console.log('output', msg);
                socket.emit('output', msg);
            });


            container.appendChild(customElement);
            if (elem.lastMsg) updateElem(elem.lastMsg);
        });
    });

    function updateElem(msg) {
        console.log('input', msg);
        var elem = document.getElementById(msg.id);
        if (typeof msg.payload !== 'object') {
            elem.setAttribute(elements[msg.id].valueAttribute, msg.payload);
        } else {
            Object.keys(msg.payload).forEach(function (attr) {
                var val = msg.payload[attr];
                if (val !== null) {
                    elem.setAttribute(attr, val);
                } else {
                    elem.removeAttribute(attr);
                }
            });
        }

    }

    socket.on('input', updateElem);
});

