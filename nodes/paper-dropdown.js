module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperDropdownNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-dropdown',
                parent:         config.parent,
                element:        'node-red-paper-dropdown',
                label:           config.label,
                attrs:          ['options', 'label'],
                valueAttribute: 'value',
                event:          'selected-change:payload',
                width:          config.width,
                height:         config.height,
                options:        config.options,
                topic:          config.topic
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-dropdown", PolymerPaperDropdownNode);
};
