module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-button',
                parent:         config.parent,
                element:        'node-red-paper-button',
                label:          config.label,
                raised:         config.raised ? '' : null,
                disabled:       config.disabled ? '' : null,
                repeat:         config.repeat,
                attrs:          ['raised', 'label', 'disabled', 'repeat'],
                valueAttribute: 'active',
                valueFalseNull: true,
                event:          'send',
                width:          config.width,
                height:         config.height,
                icon:           config.icon,
                topic:          config.topic,
                payload:        config.payload,
                payloadType:    config.payloadType
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-button", PolymerPaperButtonNode);
};
