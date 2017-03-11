module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function GoogleChartGaugeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'google_chart-gauge',
                parent:         config.parent,
                element:        'node-red-chart-gauge',
                label:          config.label,
                attrType:       'gauge',
                attrs:          ['attrType'],
                valueAttribute: 'value',
                topic:          config.topic,
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("google_chart-gauge", GoogleChartGaugeNode);
};
