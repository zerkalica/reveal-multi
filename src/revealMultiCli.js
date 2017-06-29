// @flow

import fs from 'fs-extra'
import path from 'path'
import type {Server} from 'http'
import {getBuildInfo} from './builder'
import type {IRunOptions, IBuildOptions, IBuildInfo, IGetPageOptions} from './interfaces'

import createStaticSite from './createStaticSite'
import createServer from './createServer'

export default function revealMultiCli(options: IRunOptions): Promise<void> {
    let result: Promise<void>
    if (options.createGeneric) {
        result = fs.ensureDir(options.srcDir)
            .then(() => fs.copy(path.join(__dirname, '..', 'template'), options.srcDir))
            .then(() => {
                console.log('Created generic project in ' + options.srcDir)
            })
    } else if (options.runServer) {
        result = getBuildInfo(options)
            .then(createServer)
            .then((server: Server) => {
                console.log(`open http://localhost:${server.address().port}/`)
            })
    } else {
        result = getBuildInfo(options)
            .then(createStaticSite)
            .then((info: IBuildInfo) => {
                console.log(`${info.pages
                    .map((page: IGetPageOptions) => page.dir).join(', ')} builded in ${info.options.destDir}`)
            })
    }

    return result
        .catch((e: Error) => {
            console.error(e)
        })
}
