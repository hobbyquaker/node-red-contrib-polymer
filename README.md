# node-red-contrib-polymer

# **UNMAINTAINED** I stopped working on this project in favor of its successor: https://github.com/hobbyquaker/feezal


[![NPM version](https://badge.fury.io/js/node-red-contrib-polymer.svg)](http://badge.fury.io/js/node-red-contrib-polymer)
[![License][mit-badge]][mit-url]

> A Polymer based dashboard UI for Node-RED

This is very similar to [node-red-dashboard](https://github.com/node-red/node-red-dashboard). 
In fact it's a fully rewritten fork of Andrei Tatars original 
[node-red-contrib-ui](https://github.com/andrei-tatar/node-red-contrib-ui).


## FAQs

#### Is this Project still alive?

* ~~I'm sorry to say that since March 2017 I didn't find time/motivation to develop this further. However I wouldn't call it "dead' yet, I'm still hoping that I will continue working on it, right now I'm also waiting for the Polymer 3 release that will require a larger modification of the projects structure and the elements definitions~~
* ~~Anyhow I'm still happy to receive pull requests and will try my best to fulfill the maintainers role and merge them as quickly as possible.~~
* **NO**. I'm now working on its successor: https://github.com/hobbyquaker/feezal


#### So why another Node-RED Dashboard UI when node-red-dashboard already exists?

* Mhmm. There are reasons.


#### Can node-red-contrib-polymer and node-red-dashboard coexist on one node-red instance?

* Yes, it's no problem to install and use them both.


#### What are the differences between node-red-dashboard and node-red-contrib-polymer?

* Uses [Polymer](https://www.polymer-project.org) instead of Angular. I don't like Angular. Your mileage may vary.
* Sites: You can create an unlimited number of independent dashboards.
* Hash-Navigation: Sites and pages are reflected as an URL hash, you can directly jump to a specific page and the 
browser navigation works as expected.
* When Deploying in Node-RED the current Page will be preserved after reload. It's even possible to optionally preserve 
the scroll position.
* Sites, pages and groups are "normal" nodes. That makes it more intuitive to directly manipulate them through messages
and they can also output status information.
* *All* HTML-attributes of every node can be easily manipulated by just passing a message to them.
* No fixed grid, nodes can be sized without restrictions.
* Toasts can be bound to specific sites or pages.
* Buttons can send messages repeatedly on continuous press with configurable interval.
* Collapsible Group Containers.
* Icon preview and autocomplete.


This project is in an early development stage, see the issue tracker to get an idea of the roadmap.

Until now I'm only implementing what I want for myself, e.g. I'm only using it on my phone in portait mode,
so there is no multi-column layout yet... Several Widgets known from node-red-dashboard aren't implemented,
e.g. Audio, Chart and Form. Also there is almost no documentation done until now...


## Install

As usual do `npm install node-red-contrib-polymer`. Default URL of the Dashboard is then 
`http://<node-red-host>:<node-red-port>/polymer`.


## Usage

There are some validations, checks and convenience things missing until now, so you need to make sure that you create a 
Site Node, a Page Node and a Group Node. The Group needs to have the Page as parent, the Page needs to have the Site as 
parent. Then you can add elements with the Group as parent.

Sites and Pages need to have an unique URL-safe name.


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
{
    "label": "new label!", 
    "raised": "", 
    "disabled": null, 
    "style": {"background-color": "red", "font-weight": "bold"}, 
    "addClass": "foo"
}

```
This will change the attribute label to "new label!", add the attribute `raised`, remove the attribute `disabled`, sets 
the background-color to red, the font-weight to bold and add the class `foo` - _all with one single message_.


## Icons

node-red-contrib-polymer uses the [Font Awesome Icons](http://fontawesome.io/icons/). Just type in the name of an icon
into the icon option.

Until now Icons can be used in the Page and Button Widgets.


## Contributing

Pull requests welcome!

Please post feature requests, bug reports, suggestions and critics in the Github issue tracker.


## Development

For Development you need to `bower install` _and_ `npm install` in the src directory. 

If the `dist` folder does not exist node-red will server form the `src` folder. Mind that this can possibly lead to
reduced performance. To create a build in the `dist` folder use the Gulp task "default".


## License

MIT 

Copyright (c) 2017 Sebastian Raff    
Copyright (c) 2015 Andrei Tatar

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
