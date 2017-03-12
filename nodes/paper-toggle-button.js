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
                'class':        config.class,
                html:           config.html,
                attrs:          [],
                valueAttribute: 'checked',
                valueFalseNull: true,
                event:          'change:checked',
                width:          config.width,
                height:         config.height,
                payloadTrue:    config.payloadTrue,
                payloadFalse:   config.payloadFalse,
                payloadTrueType:    config.payloadTrueType,
                payloadFalseType:   config.payloadFalseType,
                topic:          config.topic
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-toggle-button", PolymerPaperToggleButtonNode);
};
