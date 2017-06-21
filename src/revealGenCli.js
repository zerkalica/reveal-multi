// @flow

import fs from 'fs-extra'
import path from 'path'
import type {Server} from 'http'
import createServer from './createServer'
import buildStatic from './buildStatic'
import type {IRunOptions, IBuildOptions, IBuildInfo} from './interfaces'

export default function revealGenCli(options: IRunOptions): Promise<void> {
    const staticPromise = buildStatic(options)
    let result: Promise<void>
    if (options.runServer) {
        result = staticPromise
            .then(createServer)
            .then((server: Server) => {
                console.log(`open http://localhost:${server.address().port}/`)
            })
    } else {
        result = staticPromise
            .then((info: IBuildInfo) => {
                console.log(`${info.dirs.join(', ')} builded in ${info.options.destDir}`)
            })
    }

    return result
        .catch((e: Error) => {
            console.error(e)
        })
}
