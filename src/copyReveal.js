// @flow

import path from 'path'
import fs from 'fs-extra'

import createResourceResolver from './createResourceResolver'
import createModulePathResolve from './createModulePathResolve'
import type {IConfig, IRevealDep, IRevealOptionGroup} from './interfaces'
import createFilesToDirs from './createFilesToDirs'
import getPage from './getPage'
import getIndex from './getIndex'

export default function copyReveal(
    {
        destDir,
        srcDir,
        config
    }: {
        srcDir: string;
        destDir: string;
        config: IConfig;
    }
): Promise<string[]> {
    const common = 'common'
    const commonDir = path.join(destDir, 'common')
    const baseUrl = config.baseUrl
    const npmModuleResolver = createResourceResolver(createModulePathResolve())
    const destDirResolver = createResourceResolver(
        (moduleName: string) => moduleName === 'root'
            ? destDir
            : path.join(commonDir, moduleName)
    )
    const destUrlResolver = createResourceResolver(
        (moduleName: string) =>
            moduleName === 'root'
                ? baseUrl
                : `${baseUrl}/${common}${moduleName === 'common' ? '' : `/${moduleName}`}`
    )
    function destDepResolver(dep: IRevealDep): IRevealDep {
        return {
            ...dep,
            src: destUrlResolver(dep.src)
        }
    }

    function resolveOptsGroup(grp: $Shape<IRevealOptionGroup>): $Shape<IRevealOptionGroup> {
        return {
            ...grp,
            dependencies: grp.dependencies.map(destDepResolver)
        }
    }


    function copyDirectory(resourceDir: string): Promise<void> {
        return fs.copy(npmModuleResolver(resourceDir), destDirResolver(resourceDir))
    }

    const opts = config.revealOptions
    const baseGetPageOptions = {
        js: config.js.map(destUrlResolver),
        css: config.css.map(destUrlResolver),
        cssPrint: config.cssPrint.map(destUrlResolver),
        revealOptions: {
            all: resolveOptsGroup(opts.all),
            client: resolveOptsGroup(opts.client),
            server: resolveOptsGroup(opts.server)
        }
    }

    const filesToDirs = createFilesToDirs(srcDir)

    return (config.removeDest
        ? fs.emptyDir(commonDir)
        : fs.ensureDir(commonDir)
    )
        .then(() => Promise.all([
            Promise.all(config.resourceDirs.map(copyDirectory)),
            fs.copy(srcDir, destDir),
            fs.readdir(srcDir)
        ]))
        .then(([,, files]) => filesToDirs(files))
        .then((dirs: string[]) => Promise.all([
            fs.writeFile(path.join(destDir, 'index.html'), getIndex({
                dirs: dirs
            })),
            Promise.all(dirs.map((dir) =>
                fs.writeFile(path.join(destDir, dir, 'index.html'), getPage({
                    ...baseGetPageOptions,
                    title: dir,
                    fileName: `${baseUrl}/${dir}/index.md`,
                }))
            )),
            dirs
        ]))
        .then(([,, dirs]) => dirs)
}
