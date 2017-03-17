module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function CanvasRadialGaugeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'canvas_radial-gauge',
                parent:         config.parent,
                'class':        config.class,
                element:        'node-red-radial-gauge',
                label:          config.label,
                attrs:          [],
                valueAttribute: 'value',

            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("canvas_radial-gauge", CanvasRadialGaugeNode);
};
