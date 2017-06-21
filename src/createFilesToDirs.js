// @flow

import fs from 'fs-extra'
import path from 'path'

import type {Stats} from 'fs'

type IStatRec = [string, Stats]

function isStatDirectory(sr: IStatRec): boolean {
    return sr[1].isDirectory()
}

function srToName(sr: IStatRec): string {
    return sr[0]
}

function filterStats(stats: IStatRec[]): string[] {
    return stats.filter(isStatDirectory).map(srToName)
}

export default function createFilesToDirs(srcDir: string): (files: string[]) => Promise<string[]> {
    return function filesToDirs(files: string[]): Promise<string[]> {
        return Promise.all(files.map((file) =>
            Promise.all([file, fs.lstat(path.join(srcDir, file))])
        ))
        .then(filterStats)
    }
}
