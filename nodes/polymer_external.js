module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerExternal(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_external',
                parent:         config.parent,
                'class':        config.class,
                element:        'node-red-external',
                'src-interval': config.srcInterval,
                'src-url':      config.srcUrl,
                'src-type':     config.srcType,
                attrs:          ['src-url', 'src-type', 'src-interval'],
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_external", PolymerExternal);
};
