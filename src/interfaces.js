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

export interface IThemeCssRec {
    id: string;
    href: string;
}

export interface IPageResources {
    js: string[];
    css: string[];
    themeCss: IThemeCssRec[];
    cssPrint: string[];
}

export interface IConfig {
    baseUrl: string;
    port: number;
    commonDir: string;
    removeDest: boolean;
    resourceDirs: string[];

    resources: IPageResources;

    revealOptions: IRevealOptions;
}

export interface IGetPageOptions {
    resources: IPageResources;
    dir: string;
    title: string;
    fileName: string;
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

export interface IBuildResource {
    in: string;
    out: string;
}

export interface IBuildInfo {
    config: IConfig;
    options: IBuildOptions;
    pages: IGetPageOptions[];
    resources: IBuildResource[];
}

export interface IRunOptions extends IBuildOptions {
    runServer: boolean;
    createGeneric: boolean;
}
