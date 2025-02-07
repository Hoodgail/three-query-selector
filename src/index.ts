import type { Object3D } from 'three';

export type QueryFilterFunction = (object: Object3D, value: string) => boolean;

interface QuerySegment {
     type: string | null;
     attributes: Record<string, string>;
     isDirectChild: boolean;
}

export interface QuerySelectorOptions {
     cache?: boolean;
}

const EMPTY_ARRAY: Object3D[] = [];

class QueryFilter {

     private readonly attributes: Map<string, Set<QueryFilterFunction>> = new Map();

     public add(attribute: string, filter: QueryFilterFunction): void {

          if (!this.attributes.has(attribute)) {

               this.attributes.set(attribute, new Set());
          }

          this.attributes.get(attribute)?.add(filter);
     }

     public remove(attribute: string, filter: QueryFilterFunction): void {

          if (!this.attributes.has(attribute)) {

               return;
          }

          this.attributes.get(attribute)?.delete(filter);
     }

     public has(attribute: string, filter: QueryFilterFunction): boolean {

          if (!this.attributes.has(attribute)) {

               return false;
          }

          return this.attributes.get(attribute)?.has(filter) || false;
     }

     public includes(attribute: string,): boolean {

          return this.attributes.has(attribute);
     }

     public get(attribute: string): Set<QueryFilterFunction> | undefined {

          return this.attributes.get(attribute);
     }

     public getAll(): Set<QueryFilterFunction>[] {

          return Array.from(this.attributes.values());
     }

     public clear(): void {

          this.attributes.clear();
     }

}

export class QuerySelector {

     public readonly filters: QueryFilter = new QueryFilter();

     constructor(
          private objects: Object3D[],
          private options: QuerySelectorOptions = { cache: true },
          private cache: Map<string, Object3D[]> | undefined = options.cache ? new Map() : void 0
     ) {

          this.filters.add('name', (object, value) => object.name === value);
          this.filters.add('uuid', (object, value) => object.uuid === value);
     }

     public get(query: string): Object3D[] {

          if (typeof query !== 'string') throw new Error('Invalid query: Query must be a string');

          // Trim the query.
          query = query.trim();

          if (query === '') throw new Error('Invalid query: Query must be a non-empty string');

          const cache = this.cache?.get(query);

          if (cache) return cache;

          try {

               const segments = this.parseQuery(query);

               const result = this.executeQuery(this.objects, segments);

               if (this.options.cache) {

                    this.cache?.set(query, result);
               }

               return result;

          } catch (error) {

               if (error instanceof Error) {

                    throw new Error(`Query execution failed: ${error.message}`);
               }

               throw error;
          }
     }

     private parseQuery(query: string): QuerySegment[] {

          const segments = query.split(/\s*>\s*|\s+/).map(segment => segment.trim());

          return segments.map((segment, index) => {

               try {

                    return this.parseSegment(segment, index > 0 && query.includes('>'));

               } catch (error) {

                    if (error instanceof Error) {

                         throw new Error(`Invalid segment "${segment}": ${error.message}`);

                    }

                    throw error;
               }
          });
     }

     private parseSegment(segment: string, isDirectChild: boolean): QuerySegment {

          const typeMatch = segment.match(/^(\w+)(?:\[|$)/);

          // Regular expression to match attributes in the format [<property>='value'|"<value>"]
          const attributesMatch = segment.match(/\[([^\]]+?)=['"]([^'"]*)['"]\]/g);

          // Initialize attributes object
          const attributes: Record<string, string> = {};

          if (attributesMatch) {

               // Iterate over each attribute match
               for (const attr of attributesMatch) {

                    // Extract property and value using a capturing group
                    const [, property, value] = attr.match(/\[([^\]]+?)=['"]([^'"]*)['"]\]/) || [];

                    if (property && value) {

                         attributes[property] = value;
                    }
               }
          }

          return {
               type: typeMatch ? typeMatch[1] : null,
               attributes,
               isDirectChild,
          };
     }

     private executeQuery(objects: Object3D[], segments: QuerySegment[]): Object3D[] {

          let currentObjects = objects;

          for (let i = 0; i < segments.length; i++) {

               const segment = segments[i];

               currentObjects = this.filterObjects(currentObjects, segment);

               if (currentObjects.length === 0)

                    return currentObjects; // Early exit if no objects match

               if (i < segments.length - 1 && !segments[i + 1].isDirectChild) {

                    currentObjects = this.getAllDescendants(currentObjects);
               }
          }

          return currentObjects;
     }


     private filterObjects(objects: Object3D[], segment: QuerySegment, results: Object3D[] = []): Object3D[] {

          for (const obj of objects) {

               this.filterObject(obj, segment, results);
          }

          return results;
     }

     private filterObject(obj: Object3D, segment: QuerySegment, matches: Object3D[] = []): void {

          if (matches.includes(obj) == false && this.objectMatchesSegment(obj, segment)) {

               matches.push(obj);
          }

          if (!segment.isDirectChild) {

               obj.traverse(child => {

                    if (matches.includes(child) == false && child !== obj && this.objectMatchesSegment(child, segment)) {

                         matches.push(child);
                    }

               });

          } else {

               obj.children.forEach(child => {

                    if (this.objectMatchesSegment(child, segment) && matches.includes(child) == false) {

                         matches.push(child);
                    }

               });
          }

     }

     private objectMatchesSegment(obj: Object3D, segment: QuerySegment): boolean {

          if (segment.type && obj.type !== segment.type) {

               return false;

          }

          for (let attribute in segment.attributes) {

               let value = segment.attributes[attribute];

               if (this.filters.includes(attribute)) {

                    const filters = this.filters.get(attribute) as Set<QueryFilterFunction>;

                    for (let filter of filters) {

                         if (filter(obj, value) == false) {

                              return false;
                         }
                    }

               }

          }

          return true;
     }

     private getAllDescendants(objects: Object3D[], descendants: Object3D[] = []): Object3D[] {

          objects.forEach(obj => {

               obj.traverse(child => {

                    if (child !== obj) {

                         descendants.push(child);
                    }

               });
          });

          return descendants;
     }

     /**
      * This method is called to clear the cache.
      */
     public free(): void {

          this.cache?.clear();
     }

     /**
      * This method is called when the object is disposed.
      * It should be called by the user explicitly.
      */
     dispose() {

          this.cache?.clear();

          delete this.cache;

          this.objects = EMPTY_ARRAY;
     }
} 