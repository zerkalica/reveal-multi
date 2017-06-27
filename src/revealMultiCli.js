// @flow

import fs from 'fs-extra'
import path from 'path'
import type {Server} from 'http'
import {getBuildInfo} from './builder'
import type {IRunOptions, IBuildOptions, IBuildInfo, IRevealProject} from './interfaces'

import createStaticSite from './createStaticSite'
import createServer from './createServer'

export default function revealMultiCli(options: IRunOptions): Promise<void> {
    let result: Promise<void>

    if (options.runServer) {
        result = getBuildInfo(options)
            .then(createStaticSite)
            .then(createServer)
            .then((server: Server) => {
                console.log(`open http://localhost:${server.address().port}/`)
            })
    } else {
        result = getBuildInfo(options)
            .then(createStaticSite)
            .then((info: IBuildInfo) => {
                console.log(`${info.data.projects
                    .map((ri: IRevealProject) => ri.dir).join(', ')} builded in ${info.options.destDir}`)
            })
    }

    return result
        .catch((e: Error) => {
            console.error(e)
        })
}
