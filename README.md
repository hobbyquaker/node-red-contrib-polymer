# node-red-polymer



> A Polymer based dashboard UI for Node-RED

This is very similar to [node-red-dashboard](https://github.com/node-red/node-red-dashboard). 
In fact it's a fully rewritten fork of Andrei Tatars original 
[node-red-contrib-ui](https://github.com/andrei-tatar/node-red-contrib-ui).


#### So why another dashboard UI when node-red-dashboard already exists?

* I don't like AngularJS, I favor [Polymer](https://www.polymer-project.org).
* I missed several features in node-red-dashboard...
* I think many of the node-red-dashboard concepts are to opinionated.
* Educational purpose, fun, ... :)


#### Can node-red-dashboard and node-red-polymer coexist on one node-red instance?

* Yes, it's no problem to install and use them both.


#### What are the differences between node-red-dashboard and node-red-polymer?

* Sites: You can create an unlimited number of independent dashboards.
* Hash-Navigation: Sites and pages are reflected as an URL hash, you can directly jump to a specific page.
* Sites, pages and groups are "normal" nodes. That makes it more intuitive to directly manipulate them through messages 
and they could also output status information.
* *All* HTML-attributes of every node can be easily manipulated by just passing a message to them.
* No fixed grid, nodes can be sized without restrictions.
* Toasts can be bound to specific sites or pages.
* Buttons can send messages repeatedly on continuous press with configurable interval.

This project is in an early development stage, see the issue tracker to get an idea of the roadmap.
Until now I only implemented what I want for myself, e.g. I'm only using it on my phone in portait mode,
so there is now multi-column layout until now... Also there is almost no documentation done until now...


## Contributing

Pull requests welcome!

Please post feature requests, bug reports, suggestions and critics in the Github issue tracker.


## License

MIT 

Copyright (c) 2017 Sebastian Raff
Copyright (c) 2015 Andrei Tatar
