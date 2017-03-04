module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerPaperCheckboxNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_paper-checkbox',
                parent:         config.parent,
                element:        'paper-checkbox',
                html:           config.html,
                attributes:     config.attributes,
                valueAttribute: 'checked',
                valueFalseNull: true,
                event:          'change:checked',
                width:          config.width,
                height:         config.height
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_paper-checkbox", PolymerPaperCheckboxNode);
};
