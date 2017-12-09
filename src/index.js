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

console.log(store.getAll());

if (!store.get('clientId')) {
    store.set('clientId', ('00000000' + (Math.ceil(Math.random() * Math.pow(2, 32))).toString(16)).slice(-8))
    store.set('created', new Date());
}

store.set('connectionDate', new Date());

if (!store.get('connectionCount')) {
    store.set('connectionCount', 1);
} else {
    store.set('connectionCount', store.get('connectionCount') + 1);
}




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
        //console.log(socket);
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
            if (!page.parent) {
                console.log('Error: page', key, 'has no parent. skipping', page);
                return;
            }
            var site = sites[page.parent];
            pagePaths[site.name + '/' + page.name] = page.id;
            if (!tree[site.id]) tree[page.parent] = {};
            if (!tree[site.id][page.id]) tree[site.id][page.id] = {};
        });
        Object.keys(groups).forEach(function (key) {
            var group = groups[key];
            if (!group.parent) {
                console.log('Error: group', key, 'has no parent. skipping', group);
                return;
            }
            var page = pages[group.parent];
            var site = sites[page.parent];
            if (!tree[site.id][page.id]) tree[site.id][page.id] = {};
            tree[site.id][page.id][group.id] = [];
        });
        Object.keys(elements).forEach(function (key) {
            var element = elements[key];
            if (element.element !== 'paper-toast') {
                if (!element.parent) {
                    console.log('Error: element', key, 'has no parent. skipping', element);
                    return;
                }
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
        if (!sitePaths[siteName] || !sites[sitePaths[siteName]]) {
            console.error(siteName);
            return;
        }
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

    if (sites[siteId].css) {
        var style = document.createElement('style');
        style.innerText = sites[siteId].css;
        document.querySelector('head').append(style);
    }

    document.querySelector('div.loader').style.display = 'none';

    var container = document.querySelector('node-red-polymer');
    container.setAttribute('title', pages[pageId].title);

    if (sites[siteId].forceNarrow) {
        container.setAttribute('force-narrow', '');
    }
    if (sites[siteId].fixed) {
        container.setAttribute('fixed', '');
    }
    if (sites[siteId].reveals) {
        container.setAttribute('reveals', '');
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

    if (sites[siteId].saveScroll) saveScroll();

    siteOutput(siteId, pageId);

}

function saveScroll() {
    var scrollTimer;
    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
            var scrollObj = {};
            scrollObj[currentSiteName + '/' + currentPageName] = window.scrollY;
            store.set('scrollY', scrollObj);
        }, 250);
    });

    var scrollY = store.get('scrollY');
    if (scrollY && scrollY[currentSiteName + '/' + currentPageName]) {
        setTimeout(function () {
            window.scrollTo(0, scrollY[currentSiteName + '/' + currentPageName]);
        }, 300);
    }
}


function siteOutput(siteId, pageId) {
    var msg = {id: siteId, payload: {
        clientId: store.get('clientId'),
        pageId: pageId
    }};
    if (socket) socket.emit('output', msg);
}


function createToasts() {
    toasts.forEach(function (toast) {
        if (pages[toast.parent]) {
            var page = document.getElementById(elementId(toast.parent));
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

    var siteId = sitePaths[currentSiteName];
    var pageId = pagePaths[currentSiteName + '/' + pageName];

    var container = document.querySelector('node-red-polymer');
    container.setAttribute('title', pages[pageId].title);

    document.querySelector('node-red-polymer').select();

    siteOutput(siteId, pageId);
}


function createPage(pageId, siteId) {
    var page = pages[pageId];
    var pageElem = document.createElement('div');
    pageElem.setAttribute('id', elementId(pageId));

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

    pageElem.className = 'page' + (page['class'] ? ' ' + page['class'] : '');
    return pageElem;
}

function createGroup(groupId, pageId, siteId) {
    var group = groups[groupId];


    switch (group.type) {
        case 'polymer_nav_group':
            var groupElem = document.createElement('paper-card');
            groupElem.setAttribute('id', elementId(groupId));
            var contentElem = document.createElement('div');
            contentElem.className = 'card-content';
            if (group.title) groupElem.setAttribute('heading', group.title);
            groupElem.appendChild(contentElem);
            break;

        case 'polymer_nav_group_collapsible':
            var groupElem = document.createElement('node-red-collapse');
            groupElem.setAttribute('id', elementId(groupId));
            if (group.title) groupElem.setAttribute('heading', group.title);
            if (group.saveOpened && store.get(groupId) && store.get(groupId).opened) groupElem.setAttribute('opened', true);
            if (group.saveOpened) {
                groupElem.addEventListener('change', function (event) {
                    var groupStore = store.get(groupId) || {}
                    groupStore.opened = event.detail;
                    store.set(groupId, groupStore);
                    if (socket) socket.emit('output', {
                        id: groupId,
                        payload: event.detail
                    });

                });
            }
            break;

    }

    if (group.lastMsg) {
        setTimeout(function () {
            updateElem(group.lastMsg);
        }, 0);
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

    if (elem.class) {
        elem.class.split(' ').forEach(function (c) {
            customElement.classList.add(c);
        });
    }

    if (elem.html && elem.element.indexOf('node-red-template-') === -1) {
        var newContent = document.createTextNode(elem.html);
        customElement.appendChild(newContent);
    }

    if (elem.attrs && elem.attrs.forEach) {
        elem.attrs.forEach(function (attr) {
            var value = elem[attr];
            if (attr === 'attrType') attr = 'type';
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
    console.log('updateElem', msg)
    var elem = document.getElementById(elementId(msg.id));
    if (!elem) return;

    var replacement;
    var replaced;

    var subject;
    if (elements[msg.id]) subject = elements[msg.id];
    if (groups[msg.id]) subject = groups[msg.id];
    if (pages[msg.id]) subject = pages[msg.id];
    if (sites[msg.id]) subject = sites[msg.id];

    console.log('subject', subject);



    if (typeof subject.payloadFalse !== 'undefined') {
        switch (subject.payloadFalseType) {
            case 'bool':
                replacement = subject.payloadFalse === 'true';
                break;
            case 'num':
                replacement = parseFloat(subject.payloadFalse);
                break;
            default:
                replacement = subject.payloadFalse;
        }
        if (msg.payload === replacement) {
            msg.payload = false;
            replaced = true;
        }

        if (!replaced && typeof subject.payloadTrue !== 'undefined') {
            switch (subject.payloadTrueType) {
                case 'bool':
                    replacement = subject.payloadTrue === 'true';
                    break;
                case 'num':
                    replacement = parseFloat(subject.payloadTrue);
                    break;
                default:
                    replacement = subject.payloadTrue;
            }
            if (msg.payload === replacement) msg.payload = true;
        }

    }

    if (subject.valueFalseNull && msg.payload === false) msg.payload = null;

    if (msg.payload === null || (typeof msg.payload === 'undefined')) {
        elem.removeAttribute(subject.valueAttribute);
    } else if (typeof msg.payload !== 'object') {
        elem.setAttribute(subject.valueAttribute, msg.payload);
    } else {
        Object.keys(msg.payload).forEach(function (attr) {
            var val = msg.payload[attr];

            if (attr === 'style' && typeof val === 'object') {
                // TODO some elements need workaround:
                // when they are rendered with display:none on start they render wrong size when
                // display:none is removed later
                Object.keys(val).forEach(function (style) {
                    elem.style[style] = val[style];
                });

            } else if (attr === 'addClass') {
                if (typeof val === 'string') {
                    val = val.split(' ');
                }
                if (typeof val === 'object' && val.forEach) {
                    val.forEach(function (c) {
                        elem.classList.add(c);
                    });
                }

            } else if (attr === 'removeClass') {
                if (typeof val === 'string') {
                    val = val.split(' ');
                }
                if (typeof val === 'object' && val.forEach) {
                    val.forEach(function (c) {
                        elem.classList.remove(c);
                    });
                }

            } else {
                if (attr === 'attrType') {
                    attr = 'type';
                }
                if (val !== null) {
                    elem.setAttribute(attr, val);
                } else {
                    elem.removeAttribute(attr);
                }
            }

        });
    }
}
