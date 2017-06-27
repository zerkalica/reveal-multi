// @flow

import type {IGetPageOptions} from '../interfaces'

function replacer(key: string, val: mixed): mixed {
    if (
        typeof val === 'string'
        && ((val.indexOf('() =>') === 0 || val.indexOf('function() {') === 0))
    ) {
        return '@@' + val + '@@'
    }

    return val
}

export default function getPage(
    {
        fileName,
        title,
        js,
        css,
        cssPrint,
        revealOptions
    }: IGetPageOptions,
    liveReload?: boolean = false
): string {
    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link rel="icon" href="data:;base64,iVBORw0KGgo=">
        ${css.map((cssPath: string) =>
            `<link rel="stylesheet" href="${cssPath}">`
        ).join("\n")}
        ${cssPrint.map((cssPath: string) =>
            `<link rel="stylesheet" href="${cssPath}" media="print">`
        ).join("\n")}
        ${liveReload ? `
            <script>
                document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
                ':35729/livereload.js?snipver=1"></' + 'script>')
            </script>
        ` : ''}
    </head>
    <body>
        <div class="reveal">
            <div class="slides">
                <section data-markdown="${fileName}"
                    data-separator="^(\\r\\n?|\\n)---(\\r\\n?|\\n)$"
                    data-separator-vertical="^(\\r\\n?|\\n)----(\\r\\n?|\\n)$"
                    data-separator-notes="^Note:"
                ></section>
            </div>
        </div>
        ${js.map((jsPath: string) =>
            `<script src="${jsPath}"></script>`
        ).join("\n")}
        <script>
            RevealMulti.init(${JSON.stringify(revealOptions, replacer, '  ')
                .replace(/\"@@(.*?)@@\"/g, '$1')})
        </script>
    </body>
</html>
`
}
