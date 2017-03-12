module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperToastNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-toast',
                parent:         config.parent,
                element:        'paper-toast',
                'class':        config.class,
                text:           config.text,
                'on-click': 'this.close',
                'always-on-top':            config.alwaysOnTop              ? '' : null,
                'no-cancel-on-esc-key':       config.noCancelOnEscKey         ? '' : null,
                'no-cancel-on-outside-click': config.noCancelOnOutsideClick   ? '' : null,
                duration:       config.duration ? config.duration : Infinity,
                attrs:          ['on-click', 'always-on-top', 'no-cancel-on-esc-key', 'no-cancel-on-outside-click', 'duration', 'text'],
                valueAttribute: 'opened',
                valueFalseNull: true
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-toast", PolymerPaperToastNode);
};
