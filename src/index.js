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
var toasts = [];

var socket;


window.addEventListener('WebComponentsReady', function (e) {


    function hashChange() {
        var hash = location.hash.substr(2);
        //console.log('hashChange', hash);
        var path = hash.split('/');
        navigate(path[0], path[1]); // site, page
    }

    window.addEventListener('hashchange', hashChange);

    socket = io({path: location.pathname + 'socket.io'});
    socket.on('connect', function () {
        document.getElementById('disconnect').removeAttribute('opened');
    });

    socket.on('disconnect', function () {
        document.getElementById('disconnect').setAttribute('opened', '');
    });

    socket.on('update', function (data) {
        if (!isFirstUpdate) {
            location.reload();
            return;
        } else {
            isFirstUpdate = false;
        }

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
            if (element.element !== 'paper-toast') {
                var group = groups[element.parent];
                var page = pages[group.parent];
                var site = sites[page.parent];
                if (!tree[site.id][page.id][group.id]) tree[site.id][page.id][group.id] = [];
                tree[site.id][page.id][group.id].push(element.id);
            } else {
                toasts.push(element);
            }
        });

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
        location.reload();
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

    var siteId = sitePaths[siteName];
    var pageId = pagePaths[siteName + '/' + pageName];


    //var container = document.createElement('node-red-polymer');
    //document.querySelector('body').appendChild(container);

    document.querySelector('title').innerHTML = sites[siteId].title;

    if (sites[siteId].theme) {
        document.querySelector('body').className = 'theme-' + sites[siteId].theme;
        Polymer.updateStyles();
    }
    document.querySelector('div.loader').style.display = 'none';



    var container = document.querySelector('node-red-polymer');
    container.setAttribute('title', pages[pageId].title);
    if (sites[siteId].forceNarrow) {
        container.setAttribute('force-narrow', '');
    }

    var menu = [];

    sites[siteId].pageOrder.forEach(function (pageId) {
        if (tree[siteId][pageId]) {
            Polymer.dom(container).appendChild(createPage(pageId, siteId));
            var icon = 'menu-icon';
            if (pages[pageId].icon) icon = icon + ' fa fa-' + pages[pageId].icon;
            menu.push({title: pages[pageId].title, icon: icon, path: siteName + '/' + pages[pageId].name});
        }
    });

    Object.keys(tree[siteId]).forEach(function (pageId) {
        if (sites[siteId].pageOrder.indexOf(pageId) === -1) {
            Polymer.dom(container).appendChild(createPage(pageId, siteId));
            var icon = 'menu-icon';
            if (pages[pageId].icon) icon = icon + ' fa fa-' + pages[pageId].icon;
            menu.push({title: pages[pageId].title, icon: icon, path: siteName + '/' + pages[pageId].name});
        }
    });
    container.menu = menu;

    setTimeout(createToasts, 0);

}

function createToasts() {
    toasts.forEach(function (toast) {
        if (pages[toast.parent]) {
            var page = document.getElementById('page-' + toast.parent.replace('.', '_'));
            if (page) {
                createElement(toast, page);
            }
        } else if ((sites[toast.parent] && (currentSiteName === sites[toast.parent].name)) || (!toast.parent)) {
            createElement(toast, document.querySelector('body'));
        }
    });
}

function pageChange(pageName) {
    currentPageName = pageName;

    var pageId = pagePaths[currentSiteName + '/' + pageName];

    var container = document.querySelector('node-red-polymer');
    container.setAttribute('title', pages[pageId].title);

    document.querySelector('node-red-polymer').select();
}


function createPage(pageId, siteId) {
    var page = pages[pageId];
    var pageElem = document.createElement('div');
    pageElem.setAttribute('id', 'page-' + pageId.replace('.', '_'));

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
    var group = groups[groupId];

    var groupElem = document.createElement('paper-card');
    groupElem.setAttribute('id', 'group-' + groupId.replace('.', '_'));

    switch (group.type) {
        case 'polymer_nav_group':
            var contentElem = document.createElement('div');
            contentElem.className = 'card-content';
            if (group.title) groupElem.setAttribute('heading', group.title);
            groupElem.appendChild(contentElem);
            break;

        case 'polymer_nav_group_collapsible':
            var collapse = document.createElement('node-red-collapse');
            if (group.title) collapse.setAttribute('heading', group.title);
            groupElem.appendChild(collapse);
            break;

    }

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


}

function createElement(elem, container) {
    var elemId = elem.id;
    var customElement = document.createElement(elem.element);
    customElement.classList.add('node-red-widget');

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
            if (attr === 'inputType') attr = 'type';
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
            if (payload === true && (typeof elem.payloadTrue !== 'undefined')) {
                switch (elem.payloadTrueType) {
                    case 'bool':
                        payload = elem.payloadTrue === 'true';
                        break;
                    case 'num':
                        payload = parseFloat(elem.payloadTrue);
                        break;
                    default:
                        payload = elem.payloadTrue;
                }
            } else if (payload === false && (typeof elem.payloadFalse !== 'undefined')) {
                switch (elem.payloadFalseType) {
                    case 'bool':
                        payload = elem.payloadFalse === 'true';
                        break;
                    case 'num':
                        payload = parseFloat(elem.payloadFalse);
                        break;
                    default:
                        payload = elem.payloadFalse;
                }
            }
            var msg = {id: elemId, payload: payload};
            if (elem.topic) msg.topic = elem.topic;
            socket.emit('output', msg);
        });
    }

    container.appendChild(customElement);

    if (elem.lastMsg) {
        setTimeout(function () {
            updateElem(elem.lastMsg);
        }, 0);
    }

}


function elementId(id) {
    return 'node-' + id.replace('.', '_');
}

function updateElem(msg) {
    var elem = document.getElementById(elementId(msg.id));
    if (!elem) return;

    var replacement;
    if (typeof elements[msg.id].payloadFalse !== 'undefined') {
        switch (elements[msg.id].payloadFalseType) {
            case 'bool':
                replacement = elements[msg.id].payloadFalse === 'true';
                break;
            case 'num':
                replacement = parseFloat(elements[msg.id].payloadFalse);
                break;
            default:
                replacement = elements[msg.id].payloadFalse;
        }
        if (msg.payload === replacement) {
            msg.payload = false;
        } else if (typeof elements[msg.id].payloadTrue !== 'undefined') {
            switch (elements[msg.id].payloadTrueType) {
                case 'bool':
                    replacement = elements[msg.id].payloadTrue === 'true';
                    break;
                case 'num':
                    replacement = parseFloat(elements[msg.id].payloadTrue);
                    break;
                default:
                    replacement = elements[msg.id].payloadTrue;
            }
            if (msg.payload === replacement) msg.payload = true;
        }

    }

    if (elements[msg.id].valueFalseNull && msg.payload === false) msg.payload = null;

    if (msg.payload === null || (typeof msg.payload === 'undefined')) {
        elem.removeAttribute(elements[msg.id].valueAttribute);
    } else if (typeof msg.payload !== 'object') {
        elem.setAttribute(elements[msg.id].valueAttribute, msg.payload);
    } else {
        Object.keys(msg.payload).forEach(function (attr) {
            var val = msg.payload[attr];
            if (attr === 'inputType') attr = 'type';
            if (val !== null) {
                elem.setAttribute(attr, val);
            } else {
                elem.removeAttribute(attr);
            }
        });
    }

}
