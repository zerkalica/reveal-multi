// @flow

import fs from 'fs-extra'
import path from 'path'

import defaultConfig from './defaultConfig'
import merge from './merge'
import getPageOptions from './getPageOptions'
import getResources from './getResources'
import type {IBuildInfo, IBuildResource, IBuildOptions, IConfig, IGetPageOptions} from '../interfaces'

function bufferToObject<V: Object>(buf: Buffer): V {
    return JSON.parse(buf.toString())
}

export default function getBuildInfo(options: IBuildOptions): Promise<IBuildInfo> {
    const {srcDir, destDir} = options
    const projectConfig = path.join(srcDir, 'reveal-multi.json')
    return fs.pathExists(projectConfig)
        .then((exists: boolean) =>
            exists
                ? fs.readFile(projectConfig)
                    .then(bufferToObject)
                    .then((config: $Shape<IConfig>) => merge([defaultConfig, config]))
                : defaultConfig
        )
        .then((config: IConfig) => Promise.all([
            config,
            getPageOptions({srcDir, config}),
            getResources({
                destDir,
                commonDir: path.join(destDir, config.commonDir),
                resourceDirs: config.resourceDirs
            })
        ]))
        .then(([config, pages, resources]: [IConfig, IGetPageOptions[], IBuildResource[]]) => ({
            config,
            options,
            pages,
            resources
        }))
}
