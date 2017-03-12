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
                'class':        config.class,
                label:          config.label,
                raised:         config.raised ? '' : null,
                disabled:       config.disabled ? '' : null,
                repeat:         config.repeat,
                attrs:          ['raised', 'label', 'disabled', 'repeat', 'color', 'bg-color', 'icon'],
                valueAttribute: 'active',
                valueFalseNull: true,
                event:          'send',
                width:          config.width,
                height:         config.height,
                colorActive:    config.colorActive,
                color:          config.colorActive ? config.color : '',
                bgColorActive:  config.bgColorActive,
                'bg-color':     config.bgColorActive ? config.bgColor : '',
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
