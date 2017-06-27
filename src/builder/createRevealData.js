// @flow

import path from 'path'
import fs from 'fs-extra'

import createResourceResolver from '../common/createResourceResolver'
import createModulePathResolve from '../common/createModulePathResolve'
import type {
    IConfig,
    IRevealDep,
    IRevealOptionGroup,
    IGetPageOptions,
    IThemeCssRec,
    IPageResources
} from '../interfaces'
import getIndex from '../common/getIndex'

import createFilesToDirs from './createFilesToDirs'

export default function createRevealData(
    {
        srcDir,
        config
    }: {
        srcDir: string;
        config: IConfig;
    }
): Promise<IGetPageOptions[]> {
    const common = 'common'
    const {baseUrl} = config
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

    function cssUrlResolver(item: IThemeCssRec): IThemeCssRec {
        return {
            id: item.id,
            href: destUrlResolver(item.href)
        }
    }
    const rcs = config.resources
    const opts = config.revealOptions
    const resources: IPageResources = {
        js: rcs.js.map(destUrlResolver),
        css: rcs.css.map(destUrlResolver),
        themeCss: rcs.themeCss.map(cssUrlResolver),
        cssPrint: rcs.cssPrint.map(destUrlResolver)
    }

    const revealOptions = {
        all: resolveOptsGroup(opts.all),
        client: resolveOptsGroup(opts.client),
        server: resolveOptsGroup(opts.server)
    }


    return fs.readdir(srcDir)
        .then(createFilesToDirs(srcDir))
        .then((dirs: string[]) => dirs.map((dir: string) => ({
                resources,
                revealOptions,
                dir,
                title: dir,
                fileName: './index.md'
            }))
        )
}
