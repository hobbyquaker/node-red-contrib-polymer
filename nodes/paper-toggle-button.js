module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperToggleButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-toggle-button',
                parent:         config.parent,
                element:        'paper-toggle-button',
                html:           config.html,
                attributes:     config.attributes,
                valueAttribute: 'checked',
                event:          'change:checked',
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-toggle-button", PolymerPaperToggleButtonNode);
};
