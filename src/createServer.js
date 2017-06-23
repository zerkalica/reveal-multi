// @flow

import fs from 'fs-extra'
import path from 'path'
import http from 'http'
import connect from 'connect'
import SrMdl from 'middleware-static-livereload'
import SocketIO from 'socket.io'
import serveStatic from 'serve-static'

import getIndex from './getIndex'
import type {IBuildInfo, ICreds} from './interfaces'
import createCreds, {createHash} from './createCreds'
import _debug from 'debug'

const debug = _debug('reveal-multi:createServer')

function createGetSecretItem(creds: ICreds): (dir: string) => string {
    return function getSecretItem(dir: string): string {
        return `${dir}: <a href="../${dir}/?secret=${creds.secret}&id=${creds.id}">master</a>,
            <a href="../${dir}/?id=${creds.id}">client</a>
        `
    }
}

function createGetToken({creds, dirs}: {
    creds: ICreds;
    dirs: string[];
}) {
    return function getToken(req: http.ClientRequest, res: http.ServerResponse, next: () => void) {
        const url = req.url || ''
        const isParamsExists = url !== '/'
        if (!isParamsExists) {
            res.end(getIndex({
                dirs,
                getItem: createGetSecretItem(creds)
            }))
        } else {
            next()
        }
    }
}

function createSocketIO(httpServer: http.Server): () => void {
    const ioServer = SocketIO(httpServer)
    ioServer.on('connection', (socket) => {
        socket.on('multiplex-statechanged', (data: Object) => {
            debug('data: ', JSON.stringify(data, null, '  '))
            if (!data.secret) {
                return
            }

            if (createHash(data.secret) === data.socketId) {
                debug('ok')
                data.secret = null
                socket.broadcast.emit(data.socketId, data)
            }
        })
    })

    return () => ioServer.close()
}

export default function createServer(
    {
        options,
        dirs,
        config
    }: IBuildInfo,
    creds?: ICreds = createCreds()
): http.Server {
    const app = connect()
    const {destDir, srcDir} = options
    const {port} = config
    const server = http.createServer(app)
    createSocketIO(server)

    function getDestFilePath(srcFilePath: string): string {
        return path.join(destDir, srcFilePath.substring(srcDir.length))
    }

    function onFileChange(p: string) {
        debug(`copy ${p} ${getDestFilePath(p)}`)
        fs.copy(p, getDestFilePath(p))
    }

    function onFileRemove(p: string) {
        debug(`remove ${getDestFilePath(p)}`)
        fs.remove(getDestFilePath(p))
    }

    app.use('/', createGetToken({dirs, creds}))
    app.use('/common', serveStatic(path.join(destDir, 'common')))
    app.use(SrMdl({
        livereload: {
            exts: ['md']
        },
        documentRoot: srcDir
    }))
    server.listen(port)
    return server
}
