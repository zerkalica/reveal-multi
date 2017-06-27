// @flow
import _debug from 'debug'

const debug = _debug('reveal-multi:createResourceResolver')

export default function createResourceResolver(
    resolve: (moduleName: string) => string
): (dt: string) => string {
    const searchStr = new RegExp('{(.*)}')

    function resolveModule(all: string, s: string): string {
        return resolve(s)
    }

    return function resourceResolve(dirTemplate: string): string {
        const result = dirTemplate.replace(searchStr, resolveModule)
        debug(`template=${dirTemplate}, result=${result}`)
        return result
    }
}
