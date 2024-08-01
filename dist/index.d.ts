import { Object3D } from 'three';

export type QueryFilterFunction = (object: Object3D, value: string) => boolean;
export interface QuerySelectorOptions {
    cache?: boolean;
}
declare class QueryFilter {
    private readonly attributes;
    add(attribute: string, filter: QueryFilterFunction): void;
    remove(attribute: string, filter: QueryFilterFunction): void;
    has(attribute: string, filter: QueryFilterFunction): boolean;
    includes(attribute: string): boolean;
    get(attribute: string): Set<QueryFilterFunction> | undefined;
    getAll(): Set<QueryFilterFunction>[];
    clear(): void;
}
export declare class QuerySelector {
    private objects;
    private options;
    private cache;
    readonly filters: QueryFilter;
    constructor(objects: Object3D[], options?: QuerySelectorOptions, cache?: Map<string, Object3D[]> | undefined);
    get(query: string): Object3D[];
    private parseQuery;
    private parseSegment;
    private executeQuery;
    private filterObjects;
    private filterObject;
    private objectMatchesSegment;
    private getAllDescendants;
    /**
     * This method is called to clear the cache.
     */
    free(): void;
    /**
     * This method is called when the object is disposed.
     * It should be called by the user explicitly.
     */
    dispose(): void;
}
export {};
