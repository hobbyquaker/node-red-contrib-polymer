# node-red-contrib-polymer

[![NPM version](https://badge.fury.io/js/node-red-contrib-polymer.svg)](http://badge.fury.io/js/node-red-contrib-polymer)
[![Dependency Status](https://img.shields.io/gemnasium/hobbyquaker/node-red-contrib-polymer.svg?maxAge=2592000)](https://gemnasium.com/github.com/hobbyquaker/node-red-contrib-polymer)
[![License][mit-badge]][mit-url]

> A Polymer based dashboard UI for Node-RED

This is very similar to [node-red-dashboard](https://github.com/node-red/node-red-dashboard). 
In fact it's a fully rewritten fork of Andrei Tatars original 
[node-red-contrib-ui](https://github.com/andrei-tatar/node-red-contrib-ui).


## FAQs

#### So why another dashboard UI when node-red-dashboard already exists?

* I don't like AngularJS, I favor [Polymer](https://www.polymer-project.org).
* I missed several features in node-red-dashboard...
* I think many of the node-red-dashboard concepts are to opinionated.
* Educational purpose, fun, ... :)


#### Can node-red-contrib-polymer and node-red-dashboard coexist on one node-red instance?

* Yes, it's no problem to install and use them both.


#### What are the differences between node-red-dashboard and node-red-contrib-polymer?

* Sites: You can create an unlimited number of independent dashboards.
* Hash-Navigation: Sites and pages are reflected as an URL hash, you can directly jump to a specific page.
* When Deploying in Node-RED the current Page will be preserved after reload. It's even possible to optionally preserve 
the scroll position.
* Sites, pages and groups are "normal" nodes. That makes it more intuitive to directly manipulate them through messages
and they could also output status information.
* *All* HTML-attributes of every node can be easily manipulated by just passing a message to them.
* No fixed grid, nodes can be sized without restrictions.
* Toasts can be bound to specific sites or pages.
* Buttons can send messages repeatedly on continuous press with configurable interval.


This project is in an early development stage, see the issue tracker to get an idea of the roadmap.

Until now I'm only implementing what I want for myself, e.g. I'm only using it on my phone in portait mode,
so there is no multi-column layout yet... Several Widgets known from node-red-dashboard aren't implemented,
e.g. Audio, Chart and Form. Also there is almost no documentation done until now...


## Install

As usual do `npm install node-red-contrib-polymer`. Default URL of the Dashboard is then 
`http://<node-red-host>:<node-red-port>/polymer`.


## Usage

There are some checks and convinience things missing until now, so you need to make sure that you create a Site Node, 
a Page Node and a Group Node. The Group needs to have the Page as parent, the Page needs to have the Site as parent. 
Then you can add an element with the Group as parent.

### Adding and removing classes via msg

You can add or remove classes by simply sending a `msg.payload` containing an Attribute `addClass` or `removeClass`. You
can add/remove multiple classes by just seperating them with spaces.

Example `msg.payload`:
```
{"addClass": "blue bold", "removeClass": "foo"}
```
will add the classes "blue" and "bold" and remove the class "foo"


### Settings styles via msg

Example `msg.payload`:
```
{"style": {"display": "none"}}
```

### Setting arbitrary attributes via msg

You can directly set any attribute of any node. For boolean attributes use an empty string to set them and `null` to 
remove them. 

Example `msg.payload`:
```
{"label": "new label!", "raised":"", "disabled": null, "style": {"background-color": "red", "font-weight": "bold"}, "addClass": "foo"}

```
This will change the attribute label to "new label!", add the attribute `raised`, remove the attribute `disabled`, sets 
the background-color to red, the font-weight to bold and add the class `foo` - _all with one single message_.


## Contributing

Pull requests welcome!

Please post feature requests, bug reports, suggestions and critics in the Github issue tracker.

For Developing you need to `bower install` in the src directory.


## License

MIT 

Copyright (c) 2017 Sebastian Raff    
Copyright (c) 2015 Andrei Tatar

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
