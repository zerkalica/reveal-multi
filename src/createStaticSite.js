// @flow

import path from 'path'
import fs from 'fs-extra'

import createResourceResolver from './common/createResourceResolver'
import createModulePathResolve from './common/createModulePathResolve'
import type {IConfig, IRevealDep, IGetPageOptions, IBuildInfo} from './interfaces'
import getPage from './common/getPage'
import getIndex from './common/getIndex'

export default function createStaticSite(
    info: IBuildInfo
): Promise<IBuildInfo> {
    const {
        config,
        pages,
        options,
        resources
    } = info
    const dirs = pages.map((opts: IGetPageOptions) => opts.dir)

    const {srcDir, destDir} = options
    const commonDir = path.join(destDir, config.commonDir)

    function copyDirectory(rd: {in: string, out: string}): Promise<void> {
        return fs.copy(rd.in, path.join(commonDir, rd.out))
    }

    return (config.removeDest
        ? fs.emptyDir(commonDir)
        : fs.ensureDir(commonDir)
    )
        .then(() => Promise.all([
            Promise.all(resources.map(copyDirectory)),
            fs.copy(srcDir, destDir)
        ]))
        .then(() => Promise.all([
            fs.writeFile(path.join(destDir, 'index.html'), getIndex({dirs})),
            Promise.all(pages.map((page: IGetPageOptions) =>
                fs.writeFile(path.join(destDir, page.dir, 'index.html'), getPage(page))
            ))
        ]))
        .then(() => info)
}
