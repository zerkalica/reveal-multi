// @flow

import fs from 'fs-extra'
import path from 'path'

import defaultConfig from './defaultConfig'
import merge from './merge'
import copyReveal from './copyReveal'
import type {IBuildInfo, IBuildOptions, IConfig} from './interfaces'

function bufferToObject(buf: Buffer): Object {
    return JSON.parse(buf.toString())
}

export default function buildStatic(options: IBuildOptions): Promise<IBuildInfo> {
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
            copyReveal({destDir, srcDir, config})
        ]))
        .then(([config, dirs]: [IConfig, string[]]) => ({
            config,
            options,
            dirs
        }))
}
