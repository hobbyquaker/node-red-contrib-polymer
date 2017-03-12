module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerGroupNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_nav_group',
                parent:         config.parent,
                'class':        config.class,
                name:           config.name,
                title:          config.title,
                elementOrder:   config.elementOrder
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_nav_group", PolymerGroupNode);
};
