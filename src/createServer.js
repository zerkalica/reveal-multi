// @flow

import fs from 'fs-extra'
import path from 'path'
import http from 'http'
import connect from 'connect'
import {parse} from 'url'
import SrMdl from 'middleware-static-livereload'
import SocketIO from 'socket.io'
import serveStatic from 'serve-static'

import type {IBuildInfo, ICreds, IRevealProject} from './interfaces'
import createCreds, {createHash} from './createCreds'
import _debug from 'debug'
import getIndex from './common/getIndex'

const debug = _debug('reveal-multi:createServer')

function createGetSecretItem(creds: ICreds): (dir: string) => string {
    return function getSecretItem(dir: string): string {
        return `${dir}: <a href="../${dir}/?secret=${creds.secret}&id=${creds.id}">master</a>,
            <a href="../${dir}/?id=${creds.id}">client</a>
        `
    }
}


function escapeRegExp(string: string): string {
    return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1")
}

function createGetToken({baseUrl, dirs, indexPage, projects}: {
    indexPage: string;
    dirs: string[];
    baseUrl: string;
    projects: {[id: string]: string};
}) {
    const mask = `^/(${dirs.map(escapeRegExp).join('|')})/(?:index.html?)?$`
    const dirMatch = new RegExp(mask)

    debug('mask: ' + mask)

    return function getToken(req: http.ClientRequest, res: http.ServerResponse, next: () => void) {
        if (typeof req.url !== 'string') {throw new Error('req.url not found')}
        const parts = parse(`http://localhost${req.url}`)
        const pathname = parts.pathname || ''
        const found: ?string[] = pathname.match(dirMatch)
        debug('pathname: ' + pathname)
        if (found) {
            debug('found: ' + found[1])
            res.end(projects[found[1]])
        } else if (pathname === '/') {
            res.end(indexPage)
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
        data,
        config
    }: IBuildInfo,
    creds?: ICreds = createCreds()
): http.Server {
    const app = connect()
    const {destDir, srcDir} = options
    const {port} = config
    const server = http.createServer(app)
    createSocketIO(server)

    const projects: {[id: string]: string} = {}
    const dirs: string[] = []
    for (let i = 0 ; i < data.projects.length; i++) {
        const project = data.projects[i]
        projects[project.dir] = project.data
        dirs.push(project.dir)
    }

    app.use(createGetToken({
        projects,
        indexPage: getIndex({
            dirs,
            getItem: createGetSecretItem(creds)
        }),
        dirs,
        baseUrl: ''
    }))
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
