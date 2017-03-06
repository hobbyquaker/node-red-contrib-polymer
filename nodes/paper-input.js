module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperInputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-input',
                parent:         config.parent,
                element:        'paper-input',
                inputType:      config.inputType,
                attrs:          ['inputType', 'label'],
                valueAttribute: 'value',
                event:          'change:value',
                name:           config.name,
                label:          config.label,
                width:          config.width,
                height:         config.height,
                topic:          config.topic
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-input", PolymerPaperInputNode);
};
