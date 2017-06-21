// @flow

import crypto from 'crypto'
import type {ICreds} from './interfaces'

function createSecret(): string {
    const ts = new Date().getTime()
    const rand = Math.floor(Math.random()*9999999)
    const secret = ts.toString() + rand.toString()

    return secret
}

export function createHash(secret: string): string {
    const cipher = crypto.createCipher('blowfish', secret)

    return cipher.final('hex')
}


export default function createCreds(): ICreds {
    const secret = createSecret()
    return {
        secret,
        id: createHash(secret)
    }
}
