// @flow

import fr from 'find-root'
import path from 'path'
import _debug from 'debug'

const debug = _debug('reveal-gen:createModulePathResolve')

export default function createModulePathResolve(): (mn: string) => string {
    const nameToPath: Map<string, string> = new Map()
    const moduleRoot: string = fr()

    return function modulePathResolve(moduleName: string): string {
        let pathStr = nameToPath.get(moduleName)
        if (!pathStr) {
            switch (moduleName) {
                case 'reveal-gen':
                    pathStr = moduleRoot
                    break
                default:
                    try {
                        pathStr = fr(require.resolve(moduleName))
                    } catch (e) {
                        pathStr = path.resolve(moduleRoot, 'node_modules', moduleName)
                    }
            }
            if (!pathStr) {
                throw new Error('no pathStr')
            }
            nameToPath.set(moduleName, pathStr)
            debug(`name=${moduleName}, dir=${pathStr}`)
        }

        return pathStr
    }
}
