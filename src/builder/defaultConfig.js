// @flow
import type {IConfig} from '../interfaces'

const defaultConfig: IConfig = {
    __push__: ['resourceDirs', 'dependencies', 'js', 'css', 'cssPrint'],
    removeDest: true,
    baseUrl: '..',
    port: 8080,
    resourceDirs: [
        '{reveal.js}/css',
        '{reveal.js}/js',
        '{reveal.js}/lib',
        '{reveal.js}/plugin/highlight',
        '{reveal.js}/plugin/markdown',
        '{reveal.js}/plugin/math',
        '{reveal.js}/plugin/notes',
        '{reveal.js}/plugin/zoom-js',
        '{reveal.js}/plugin/multiplex/client.js',
        '{reveal.js}/plugin/multiplex/master.js',
        '{reveal.js}/plugin/print-pdf',
        '{reveal.js}/plugin/search',
        '{reveal-multi}/rgs',
        '{highlight.js}/styles',
        '{socket.io-client}/dist/socket.io.js'
    ],
    js: [
        '{reveal.js}/lib/js/head.min.js',
        '{reveal.js}/js/reveal.js',
        '{reveal-multi}/rgs/reveal-multi.js',
    ],
    css: [
        '{reveal.js}/css/reveal.css',
        '{highlight.js}/styles/dracula.css',
        '{reveal-multi}/rgs/custom.css'
    ],
    cssPrint: [
        '{reveal.js}/css/print/paper.css'
    ],
    revealOptions: {
        all: {
            showNotes: true,
            slideNumber: true,
            theme: 'custom',
            transition: 'none',
            controls: true,
            progress: true,
            history: true,
            center: true,
            multiplex: {
                secret: null,
                id: null,
                url: ''
            },
            dependencies: [
                { src: '{socket.io-client}/dist/socket.io.js', async: true },
                { src: '{reveal.js}/lib/js/classList.js', condition: '() => !document.body.classList' },
                { src: '{reveal.js}/plugin/markdown/marked.js', condition: '() => !!document.querySelector(\'[data-markdown]\')' },
                { src: '{reveal.js}/plugin/markdown/markdown.js', condition: '() => !!document.querySelector(\'[data-markdown]\')' },
                { src: '{reveal.js}/plugin/highlight/highlight.js', async: true, callback: '() => { hljs.initHighlightingOnLoad() }' },
                { src: '{reveal.js}/plugin/zoom-js/zoom.js', async: true },
                { src: '{reveal.js}/plugin/notes/notes.js', async: true },
                { src: '{reveal.js}/plugin/math/math.js', async: true }
            ]
        },
        client: {
            showNotes: false,
            dependencies: [
                { src: '{reveal.js}/plugin/multiplex/client.js', async: true }
            ]
        },
        server: {
            dependencies: [
                { src: '{reveal.js}/plugin/multiplex/master.js', async: true }
            ]
        }
    }
}

export default defaultConfig
