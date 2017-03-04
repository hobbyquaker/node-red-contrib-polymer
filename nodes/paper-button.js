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
                element:        'paper-button',
                html:           config.html,
                raised:         config.raised ? '' : null,
                attrs:          ['raised'],
                valueAttribute: 'active',
                event:          'click',
                width:          config.width,
                height:         config.height,
                topic:          config.topic,
                payload:        config.payload,
                payloadType:    config.payloadType,
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-button", PolymerPaperButtonNode);
};
