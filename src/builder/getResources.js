// @flow

import path from 'path'

import createResourceResolver from '../common/createResourceResolver'
import createModulePathResolve from '../common/createModulePathResolve'

import type {IBuildResource} from '../interfaces'

export default function getResources({resourceDirs}: {
    resourceDirs: string[];
}): IBuildResource[] {
    const npmModuleResolver = createResourceResolver(createModulePathResolve())
    const destDirResolver = createResourceResolver(
        (moduleName: string) => moduleName === 'root'
            ? ''
            : moduleName
    )

    return resourceDirs.map((dir: string) => ({
        in: npmModuleResolver(dir),
        out: destDirResolver(dir)
    }))
}
