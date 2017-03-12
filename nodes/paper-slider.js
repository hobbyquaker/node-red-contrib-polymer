module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperSliderNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-slider',
                parent:         config.parent,
                element:        'paper-slider',
                'class':        config.class,
                pin:            config.pin ? '' : null,
                snaps:          config.snaps ? '' : null,
                editable:       config.editable ? '' : null,
                min:            config.min,
                max:            config.max,
                step:           config.step,
                'max-markers':  config.maxMarkers,
                html:           config.html,
                attrs:          ['pin', 'min', 'max', 'step', 'snaps', 'max-markers', 'editable'],
                valueAttribute: 'value',
                event:          config.immediate ? 'immediate-value-change:immediateValue' : 'change:value',
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-slider", PolymerPaperSliderNode);
};
