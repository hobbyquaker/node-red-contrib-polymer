module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerTemplate(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_template',
                parent:         config.parent,
                element:        'node-red-template',
                html:           config.html,
                attributes:     config.attributes,
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_template", PolymerTemplate);
};
