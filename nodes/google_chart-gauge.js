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
                'class':        config.class,
                element:        'node-red-chart-gauge',
                label:          config.label,
                attrType:       'gauge',
                attrs:          ['attrType', 'options'],
                valueAttribute: 'value',
                topic:          config.topic,
                min:            config.min,
                max:            config.max,
                majorTicks:     config.majorTicks,
                minorTicks:     config.minorTicks,
                greenFrom:      config.greenFrom,
                greenTo:        config.greenTo,
                greenColor:     config.greenColor,
                yellowFrom:     config.yellowFrom,
                yellowTo:       config.yellowTo,
                yellowColor:    config.yellowColor,
                redFrom:        config.redFrom,
                redTo:          config.redTo,
                redColor:       config.redColor,
                width:          config.width,
                height:         config.height,
                options:        JSON.stringify({
                    min:            config.min || undefined,
                    max:            config.max,
                    width:          (config.width.indexOf('px') !== -1 ? parseInt(config.width.replace('px', ''), 10) : undefined),
                    height:         (config.height.indexOf('px') !== -1 ? parseInt(config.height.replace('px', ''), 10) : undefined),
                    majorTicks:     config.majorTicks || undefined,
                    minorTicks:     config.minorTicks || undefined,
                    greenFrom:      config.greenFrom || undefined,
                    greenTo:        config.greenTo || undefined,
                    greenColor:     config.greenColor || undefined,
                    yellowFrom:     config.yellowFrom || undefined,
                    yellowTo:       config.yellowTo || undefined,
                    yellowColor:    config.yellowColor || undefined,
                    redFrom:        config.redFrom || undefined,
                    redTo:          config.redTo || undefined,
                    redColor:       config.redColor || undefined
                })
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("google_chart-gauge", GoogleChartGaugeNode);
};
