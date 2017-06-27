// @flow

export interface IRevealDep {
    src: string;
    +condition?: ?string;
    +async?: ?boolean;
}

type IMultiplex = {
    secret: ?string;
    id: ?string;
    url: string;
}

export interface IRevealOptionGroup {
    showNotes: boolean;
    slideNumber: boolean;
    theme: string;
    transition: string;
    controls: boolean;
    progress: boolean;
    history: boolean;
    center: boolean;
    multiplex: IMultiplex;
    dependencies: IRevealDep[];
}

export interface IRevealOptions {
    all: IRevealOptionGroup;
    server: $Shape<IRevealOptionGroup>;
    client: $Shape<IRevealOptionGroup>;
}

export interface IConfig {
    baseUrl: string;
    port: number;
    removeDest: boolean;
    resourceDirs: string[];
    js: string[];
    css: string[];
    cssPrint: string[];
    revealOptions: IRevealOptions;
}


export interface ICreds {
    secret: string;
    id: string;
}


export interface IBuildOptions {
    srcDir: string;
    destDir: string;
}

export interface IRevealProject {
    dir: string;
    data: string;
}

export interface IRevealData {
    index: {
        data: string;
    },
    projects: IRevealProject[];
}

export interface IBuildInfo {
    config: IConfig;
    options: IBuildOptions;
    data: IRevealData;
}

export interface IRunOptions extends IBuildOptions {
    runServer: boolean;
}
