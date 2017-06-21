// @flow

function getPlainItem(dir: string): string {
    return `<a href="./${dir}">${dir}</a>`
}

export default function getIndex(
    {
        dirs,
        getItem = getPlainItem
    }: {
        dirs: string[];
        getItem?: (dir: string) => string;
    }
): string {
    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>All</title>
    </head>
    <body>
        <ul>
            ${dirs.map((dir) =>
                `<li>${getItem(dir)}</li>`
            ).join("\n")}
        </ul>
    </body>
</html>
`
}
