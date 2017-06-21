// @noflow

;(function(w) {
    w.RevealMulti = {
        init: function(options) {
            var params = new URLSearchParams(document.location.search)
            var secret = params.get('secret') || null
            var id = params.get('id') || null
            var envOptions = secret ? options.server : options.client
            var config = Object.assign({}, options.all, envOptions, {
                dependencies: options.all.dependencies.concat(envOptions.dependencies)
            })
            config.multiplex.secret = secret
            config.multiplex.id = id
            Reveal.initialize(config)
        }
    }
})(window);
