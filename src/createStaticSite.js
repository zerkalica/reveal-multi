// @flow

import path from 'path'
import fs from 'fs-extra'

import createResourceResolver from './common/createResourceResolver'
import createModulePathResolve from './common/createModulePathResolve'
import type {IConfig, IRevealDep, IRevealOptionGroup, IBuildInfo} from './interfaces'

export default function createStaticSite(
    info: IBuildInfo
): Promise<IBuildInfo> {
    const {
        config,
        data,
        options
    } = info
    const {index, projects} = data
    const {srcDir, destDir} = options
    const common = 'common'
    const commonDir = path.join(destDir, 'common')
    const npmModuleResolver = createResourceResolver(createModulePathResolve())
    const destDirResolver = createResourceResolver(
        (moduleName: string) => moduleName === 'root'
            ? destDir
            : path.join(commonDir, moduleName)
    )

    function copyDirectory(resourceDir: string): Promise<void> {
        return fs.copy(npmModuleResolver(resourceDir), destDirResolver(resourceDir))
    }

    return (config.removeDest
        ? fs.emptyDir(commonDir)
        : fs.ensureDir(commonDir)
    )
        .then(() => Promise.all([
            Promise.all(config.resourceDirs.map(copyDirectory)),
            fs.copy(srcDir, destDir)
        ]))
        .then(() => Promise.all([
            fs.writeFile(path.join(destDir, 'index.html'), index.data),
            Promise.all(projects.map((project) =>
                fs.writeFile(path.join(destDir, project.dir, 'index.html'), project.data)
            ))
        ]))
        .then(() => info)
}
