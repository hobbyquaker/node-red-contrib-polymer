module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperInputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-input',
                parent:         config.parent,
                element:        'node-red-paper-input',
                'class':        config.class,
                attrType:       config.attrType,
                attrs:          ['attrType', 'label', 'min', 'max', 'step', 'maxlength', 'pattern', 'has-button', 'label-button', 'raised-button'],
                valueAttribute: 'value',
                event:          'set:value',
                name:           config.name,
                label:          config.label,
                width:          config.width,
                height:         config.height,
                topic:          config.topic,
                'has-button':   config.hasButton ? '' : null,
                'label-button': config.labelButton,
                'raised-button': config.raisedButton
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-input", PolymerPaperInputNode);
};
