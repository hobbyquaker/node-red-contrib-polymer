module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperDropdownNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-dropdown',
                parent:         config.parent,
                element:        'node-red-paper-dropdown',
                'class':        config.class,
                label:           config.label,
                attrs:          ['options', 'label', 'horizontal-align', 'vertical-align', 'menu-width'],
                valueAttribute: 'value',
                event:          'selected-change:payload',
                width:          config.width,
                'menu-width':   'min-width: ' + config.menuWidth,
                height:         config.height,
                options:        config.options,
                topic:          config.topic,
                'horizontal-align': config.horizontalAlign,
                'vertical-align': config.verticalAlign
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-dropdown", PolymerPaperDropdownNode);
};
