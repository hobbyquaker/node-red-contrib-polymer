module.exports = function(RED) {

    var ui = require('../ui')(RED);

    function PolymerSiteNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var done = ui.add({
            node: node,
            control: {
                type:           'polymer_nav_site',
                name:           config.name,
                title:          config.title,
                theme:          config.theme,
                pageOrder:      config.pageOrder,
                forceNarrow:    config.forceNarrow
            }
        });

        node.on("close", done);
    }

    RED.nodes.registerType("polymer_nav_site", PolymerSiteNode);
};
