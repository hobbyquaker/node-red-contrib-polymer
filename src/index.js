var isInited;

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
    console.log('components ready');


    function hashChange() {
        var hash = location.hash.substr(2);
        console.log('hashChange', hash);
        var path = hash.split('/');
        navigate(path[0], path[1]); // site, page
    }

    window.addEventListener('hashchange', hashChange);


    socket = io({path: location.pathname + 'socket.io'});
    socket.on('connect', function () {
        console.log('connect');
    });
    socket.on('event', function (data) {
        console.log('event', data);
        socket.emit('ui-replay-state');
    });
    socket.on('disconnect', function () {

    });

    socket.on('update', function (data) {
        console.log(data);

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



        console.log('sitePaths', sitePaths);
        console.log('pagePaths', pagePaths);
        console.log('tree', tree);

        if (!isInited) {
            var hash = location.hash.substr(2);
            console.log('hash', hash);
            var path = hash.split('/');
            navigate(path[0], path[1]); // site, page
        }






    });

    function updateElem(msg) {
        console.log('input', msg);
        var elem = document.getElementById(msg.id);
        if (typeof msg.payload === 'boolean') {
            if (msg.payload) {
                elem.setAttribute(elements[msg.id].valueAttribute, msg.payload);
            } else {
                elem.removeAttribute(elements[msg.id].valueAttribute);
            }
        } else if (typeof msg.payload !== 'object') {
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



function navigate(siteName, pageName) {
    console.log('navigate?', siteName, pageName, isInited);

    if (!sitePaths[siteName]) {
        siteName = Object.keys(sitePaths)[0];
        pageName = pages[Object.keys(tree[sitePaths[siteName]])[0]].name;
        window.location.hash = '#/' + siteName + '/' + pageName;
        return;
    }
    if (!pagePaths[siteName + '/' + pageName]) {
        pageName = pages[Object.keys(tree[sitePaths[siteName]])[0]].name;
        window.location.hash = '#/' + siteName + '/' + pageName;
        return;
    }

    if (currentSiteName === siteName && currentPageName === pageName) {
        // No Change
        return;
    } else if (isInited && currentSiteName !== siteName) {
        // Site Change
        console.log('site change');
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
    console.log('initSite', siteName, pageName);

    var siteId = sitePaths[siteName];

    var container = document.querySelector('node-red-polymer');


    var menu = [];
    var content = '';
    Object.keys(tree[siteId]).forEach(function (pageId) {
        console.log(pageId, pages[pageId]);
        Polymer.dom(container).appendChild(createPage(pageId, siteId));
        menu.push({title: pages[pageId].title, path: siteName + '/' + pages[pageId].name});
    });
    container.menu = menu;
}


function pageChange(pageName) {
    currentPageName = pageName;
    console.log('pageChange', pageName);
    document.querySelector('node-red-polymer').select();
}


function createPage(pageId, siteId) {
    var page = pages[pageId];
    console.log('createPage', page.name);
    var pageElem = document.createElement('div');

    Object.keys(tree[siteId][pageId]).forEach(function (groupId) {
        var groupElem = createGroup(groupId, pageId, siteId);
        createElements(groupElem, groupId, pageId, siteId);

        pageElem.appendChild(groupElem);

    });

    pageElem.className = 'page';
    return pageElem;
}

function createGroup(groupId, pageId, siteId) {
    console.log('createGroup', groupId);
    var group = groups[groupId];
    var groupElem = document.createElement('paper-card');
    if (group.title) groupElem.setAttribute('heading', group.title);
    var contentElem = document.createElement('div');
    contentElem.className = 'card-content';

    groupElem.appendChild(contentElem);




    return groupElem;
}

function createElements(groupElem, groupId, pageId, siteId) {
    tree[siteId][pageId][groupId].forEach(function (elemId) {
        var elem = elements[elemId];

        var customElement = document.createElement(elem.element);

        customElement.setAttribute('id', elemId);

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
        customElement.addEventListener(tmp[0], function (data) {
            var msg = {id: elemId, payload: customElement[tmp[1]]};
            console.log('output', msg);
            socket.emit('output', msg);
        });


        groupElem.querySelector('div.card-content').appendChild(customElement);
        if (elem.lastMsg) updateElem(elem.lastMsg);

    });



}