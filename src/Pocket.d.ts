
declare interface Store {
    version: string;
    collections: Collections;
    options: StoreOptions;
}

declare interface StoreOptions {
    autoCommit: boolean;
    dbname: string;
    driver: StoreDriverOptions;
}

declare enum StoreDriverOptions {
    DEFAULT = 'DEFAULT',
    LOCAL_STORAGE = 'LOCAL_STORAGE',
    SESSION_STORAGE = 'SESSION_STORAGE',
    WEBSQL = 'WEBSQL'
}

declare interface Collections {
    [key :string] : Collection;
}

declare interface Collection {
    name: string;
    documents: Document[];
    options: string;
    length: number;
}

declare interface Document {
    _id: string;
}
