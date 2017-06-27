// @flow

import path from 'path'
import fs from 'fs-extra'

import createResourceResolver from '../common/createResourceResolver'
import createModulePathResolve from '../common/createModulePathResolve'
import type {
    IConfig,
    IRevealDep,
    IRevealOptionGroup,
    IRevealProject,
    IRevealData
} from '../interfaces'
import getIndex from '../common/getIndex'

import createFilesToDirs from './createFilesToDirs'
import getPage from './getPage'

export default function createRevealData(
    {
        srcDir,
        config
    }: {
        srcDir: string;
        config: IConfig;
    }
): Promise<IRevealData> {
    const common = 'common'
    const baseUrl = config.baseUrl
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

    return fs.readdir(srcDir)
        .then(createFilesToDirs(srcDir))
        .then((dirs: string[]) => ({
            index: {
                data: getIndex({
                    dirs
                })
            },
            projects: dirs.map((dir: string) => ({
                dir,
                data: getPage({
                    ...baseGetPageOptions,
                    title: dir,
                    fileName: './index.md',
                })
            }))
        }))
}
