module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerGroupCollapsibleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_nav_group_collapsible',
                parent:         config.parent,
                'class':        config.class,
                name:           config.name,
                title:          config.title,
                elementOrder:   config.elementOrder,
                saveOpened:     config.saveOpened,
                valueAttribute: 'opened',
                valueFalseNull: true
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_nav_group_collapsible", PolymerGroupCollapsibleNode);
};
