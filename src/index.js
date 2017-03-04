var isInited;
var isFirstUpdate = true;

var currentSiteName;
var currentPageName;

var sites;
var pages;
var groups;
var elements;

var sitePaths = {};
var pagePaths = {};

var tree = {};

var socket;


window.addEventListener('WebComponentsReady', function (e) {
    //console.log('components ready');

    function hashChange() {
        var hash = location.hash.substr(2);
        //console.log('hashChange', hash);
        var path = hash.split('/');
        navigate(path[0], path[1]); // site, page
    }

    window.addEventListener('hashchange', hashChange);


    socket = io({path: location.pathname + 'socket.io'});
    socket.on('connect', function () {
        //console.log('connect');
    });
    socket.on('event', function (data) {
        //console.log('event', data);
        socket.emit('ui-replay-state');
    });
    socket.on('disconnect', function () {

    });

    socket.on('update', function (data) {
        if (!isFirstUpdate) {
            location.reload();
            return;
        } else {
            isFirstUpdate = false;
        }
        //console.log(data);

        sites = data.sites;
        pages = data.pages;
        groups = data.groups;
        elements = data.elements;

        Object.keys(sites).forEach(function (key) {
            var site = sites[key];
            sitePaths[site.name] = site.id;
            tree[site.id] = {};
        });
        Object.keys(pages).forEach(function (key) {
            var page = pages[key];
            var site = sites[page.parent];
            pagePaths[site.name + '/' + page.name] = page.id;
            if (!tree[site.id]) tree[page.parent] = {};
            if (!tree[site.id][page.id]) tree[site.id][page.id] = {};
        });
        Object.keys(groups).forEach(function (key) {
            var group = groups[key];
            var page = pages[group.parent];
            var site = sites[page.parent];
            if (!tree[site.id][page.id]) tree[site.id][page.id] = {};
            tree[site.id][page.id][group.id] = [];
        });
        Object.keys(elements).forEach(function (key) {
            var element = elements[key];
            var group = groups[element.parent];
            var page = pages[group.parent];
            var site = sites[page.parent];
            if (!tree[site.id][page.id][group.id]) tree[site.id][page.id][group.id] = [];
            tree[site.id][page.id][group.id].push(element.id);
        });


        //console.log('sitePaths', sitePaths);
        //console.log('pagePaths', pagePaths);
        //console.log('tree', tree);

        if (!isInited) {
            var hash = location.hash.substr(2);
            //console.log('hash', hash);
            var path = hash.split('/');
            navigate(path[0], path[1]); // site, page
        }

    });



    socket.on('input', updateElem);
});



function navigate(siteName, pageName) {
    //console.log('navigate?', siteName, pageName, isInited);

    if (!sitePaths[siteName]) {
        siteName = Object.keys(sitePaths)[0];
        var pageId = sites[sitePaths[siteName]].pageOrder[0] || Object.keys(tree[sitePaths[siteName]])[0];
        pageName = pages[pageId].name;
        window.location.hash = '#/' + siteName + '/' + pageName;
        return;
    }
    if (!pagePaths[siteName + '/' + pageName]) {
        var pageId = sites[sitePaths[siteName]].pageOrder[0] || Object.keys(tree[sitePaths[siteName]])[0];
        pageName = pages[pageId].name;
        window.location.hash = '#/' + siteName + '/' + pageName;
        return;
    }

    if (currentSiteName === siteName && currentPageName === pageName) {
        // No Change
        return;
    } else if (isInited && currentSiteName !== siteName) {
        // Site Change
        //console.log('site change');
        location.reload();
        //initSite(siteName, pageName);
    } else if (isInited && currentPageName !== pageName) {
        // Page Change
        pageChange(pageName);
    } else if (!isInited) {
        initSite(siteName, pageName);
    }


}

function initSite(siteName, pageName) {
    isInited = true;
    currentSiteName = siteName;
    currentPageName = pageName;
    //console.log('initSite', siteName, pageName);

    var siteId = sitePaths[siteName];

    var container = document.querySelector('node-red-polymer');

    container.setAttribute('title', sites[siteId].title);

    var menu = [];
    var content = '';

    sites[siteId].pageOrder.forEach(function (pageId) {
        if (tree[siteId][pageId]) {
            Polymer.dom(container).appendChild(createPage(pageId, siteId));
            menu.push({title: pages[pageId].title, path: siteName + '/' + pages[pageId].name});
        }
    });

    Object.keys(tree[siteId]).forEach(function (pageId) {
        if (sites[siteId].pageOrder.indexOf(pageId) === -1) {
            Polymer.dom(container).appendChild(createPage(pageId, siteId));
            menu.push({title: pages[pageId].title, path: siteName + '/' + pages[pageId].name});
        }
    });
    container.menu = menu;
}


function pageChange(pageName) {
    currentPageName = pageName;
    //console.log('pageChange', pageName);
    document.querySelector('node-red-polymer').select();
}


function createPage(pageId, siteId) {
    var page = pages[pageId];
    //console.log('createPage', page);
    var pageElem = document.createElement('div');

    if (!page.groupOrder) page.groupOrder = [];
    page.groupOrder.forEach(function (groupId) {
        if (tree[siteId][pageId][groupId]) {
            var groupElem = createGroup(groupId, pageId, siteId);
            createElements(groupElem, groupId, pageId, siteId);
            pageElem.appendChild(groupElem);
        }
    });

    Object.keys(tree[siteId][pageId]).forEach(function (groupId) {
        if (page.groupOrder.indexOf(groupId) === -1) {
            var groupElem = createGroup(groupId, pageId, siteId);
            createElements(groupElem, groupId, pageId, siteId);
            pageElem.appendChild(groupElem);
        }
    });

    pageElem.className = 'page';
    return pageElem;
}

function createGroup(groupId, pageId, siteId) {
    //console.log('createGroup', groupId);
    var group = groups[groupId];
    var groupElem = document.createElement('paper-card');
    if (group.title) groupElem.setAttribute('heading', group.title);
    var contentElem = document.createElement('div');
    contentElem.className = 'card-content';

    groupElem.appendChild(contentElem);

    return groupElem;
}

function createElements(groupElem, groupId, pageId, siteId) {

    var container = groupElem.querySelector('div.card-content');

    var elemOrder = groups[groupId].elementOrder;

    var cmdQueue = [];
    if (!elemOrder) elemOrder = [];
    elemOrder.forEach(function (elemId) {
        if (tree[siteId][pageId][groupId].indexOf(elemId) !== -1) {
            cmdQueue.push(function (callback) {
                createElemWrap(elements[elemId], container, callback);
            });
        }
    });

    tree[siteId][pageId][groupId].forEach(function (elemId) {
        if (elemOrder.indexOf(elemId) === -1) {
            cmdQueue.push(function (callback) {
                createElemWrap(elements[elemId], container, callback);
            });
        }
    });

    async.series(cmdQueue);

    function createElemWrap(elem, container, cb) {
        if (elem.element === 'node-red-template') {

            /* todo try again to get this working and remove this workaround!
             var tplElement = document.createElement('dom-module');
             tplElement.setAttribute('id', 'node-red-template-' + elemId);
             var tplTemplate = document.createElement('template');
             tplTemplate.setAttribute('is', 'dom-bind');
             tplTemplate.innerHTML = elem.html;
             tplElement.appendChild(tplTemplate);
             var tplScript = document.createElement('script');
             var tplScriptText = document.createTextNode('Polymer({is:"node-red-template-' + elemId + '"})');
             tplScript.appendChild(tplScriptText);
             tplElement.appendChild(tplScript);
             document.body.appendChild(tplElement);
             elem.element = 'node-red-template-' + elemId;
             createElement();
             */

            Polymer.Base.importHref(['elements/custom_template.html?node=' + elem.id], function () {
                elem.element = 'node-red-template-' + elem.id;
                createElement(elem, container);
                if (typeof cb === 'function') cb();

            });

        } else {
            createElement(elem, container);
            if (typeof cb === 'function') cb();
        }

    }

    function createElement(elem, container) {
        var elemId = elem.id;
        var customElement = document.createElement(elem.element);

        customElement.setAttribute('id', elementId(elemId));

        if (elem.width) customElement.style.width = elem.width;
        if (elem.height) customElement.style.height = elem.height;

        if (elem.html && elem.element.indexOf('node-red-template-') === -1) {
            var newContent = document.createTextNode(elem.html);
            customElement.appendChild(newContent);
        }

        if (elem.attrs && elem.attrs.forEach) {
            elem.attrs.forEach(function (attr) {
                var value = elem[attr];
                if (value === null || (typeof value === 'undefined')) {
                    customElement.removeAttribute(attr);
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                    customElement.setAttribute(attr, value);
                } else {
                    customElement.setAttribute(attr, value);
                }

            });
        }

        if (elem.event) {
            var tmp = elem.event.split(':');
            customElement.addEventListener(tmp[0], function (data) {
                var payload;
                if (typeof tmp[1] !== 'undefined') {
                    payload = customElement[tmp[1]];
                    if (typeof payload === 'undefined') return;
                } else {
                    switch (elem.payloadType) {
                        case 'bool':
                            if (typeof elem.payload !== 'boolean') payload = elem.payload === 'true';
                            break;
                        case 'num':
                            if (typeof elem.payload === 'string') payload = parseFloat(elem.payload);
                            break;
                        case 'json':
                            if (typeof elem.payload === 'string') payload = JSON.parse(elem.payload);
                            break;
                        default:
                            payload = elem.payload;
                    }

                }
                var msg = {id: elemId, payload: payload};
                if (elem.topic) msg.topic = elem.topic;
                console.log('output', msg);
                socket.emit('output', msg);
            });
        }

        container.appendChild(customElement);
        //console.log('created', elem.id);
        if (elem.lastMsg) {
            setTimeout(function () {
                updateElem(elem.lastMsg);
            }, 0);
        }

    }

}

function elementId(id) {
    return 'node-' + id.replace('.', '_');
}

function updateElem(msg) {
    console.log('input', msg);
    var elem = document.getElementById(elementId(msg.id));
    if (!elem) return;
    if (elements[msg.id].valueFalseNull && msg.payload === false) msg.payload = null;
    if (msg.payload === null || (typeof msg.payload === 'undefined')) {
        elem.removeAttribute(elements[msg.id].valueAttribute);
    } else if (typeof msg.payload !== 'object') {
        console.log('>', elements[msg.id].valueAttribute, msg.payload);
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