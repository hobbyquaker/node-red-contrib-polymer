module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPageNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_nav_page',
                title:          config.title,
                'class':        config.class,
                icon:           config.icon,
                parent:         config.parent,
                name:           config.name,
                groupOrder:     config.groupOrder
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_nav_page", PolymerPageNode);
};
