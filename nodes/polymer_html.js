module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerHTML(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_html',
                parent:         config.parent,
                'class':        config.class,
                element:        'node-red-html',
                valueAttribute: 'inner-h-t-m-l',
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_html", PolymerHTML);
};
