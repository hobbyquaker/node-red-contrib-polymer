module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperSliderNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;




        var done = ui.add({
            node: node,
            control: {
                type: 'polymer_paper-slider',
                element: 'paper-slider',
                label: config.name || config.element,
                html: config.html,
                attributes: config.attributes,
                valueAttribute: 'value',
                event: config.immediate ? 'immediate-value-change:immediateValue' : 'change:value'
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-slider", PolymerPaperSliderNode);
};