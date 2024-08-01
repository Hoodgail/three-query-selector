import type { Object3D } from 'three';

interface QuerySegment {
     type: string | null;
     name: string | null;
     uuid: string | null;
     isDirectChild: boolean;
}

export class QuerySelector {

     private cache: Map<string, Object3D[]> = new Map();

     constructor(
          private objects: Object3D[]
     ) { }

     public get(query: string): Object3D[] {

          if (typeof query !== 'string' || query.trim() === '')
               throw new Error('Invalid query: Query must be a non-empty string');

          const cachedResult = this.cache.get(query);

          if (cachedResult) return cachedResult;

          try {
               const segments = this.parseQuery(query);
               const result = this.executeQuery(this.objects, segments);
               this.cache.set(query, result);
               return result;
          } catch (error) {
               if (error instanceof Error) {
                    throw new Error(`Query execution failed: ${error.message}`);
               }
               throw error;
          }
     }

     private parseQuery(query: string): QuerySegment[] {
          // Split by '>' for direct child queries, but also split by space for descendant queries
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
          const nameMatch = segment.match(/\[name=['"](.+)['"]\]/);
          const uuidMatch = segment.match(/\[uuid=['"](.+)['"]\]/);

          return {
               type: typeMatch ? typeMatch[1] : null,
               name: nameMatch ? nameMatch[1] : null,
               uuid: uuidMatch ? uuidMatch[1] : null,
               isDirectChild,
          };
     }

     private executeQuery(objects: Object3D[], segments: QuerySegment[]): Object3D[] {
          let currentObjects = objects;

          for (let i = 0; i < segments.length; i++) {
               const segment = segments[i];

               currentObjects = this.filterObjects(currentObjects, segment);

               if (currentObjects.length === 0) {
                    return []; // Early exit if no objects match
               }

               if (i < segments.length - 1 && !segments[i + 1].isDirectChild) {
                    currentObjects = this.getAllDescendants(currentObjects);
               }
          }

          return currentObjects;
     }


     private filterObjects(objects: Object3D[], segment: QuerySegment): Object3D[] {

          let results: Set<Object3D> = new Set();

          for (const obj of objects) {

               const filter = this.filterObject(obj, segment);

               for (const obj of filter) {

                    results.add(obj);
               }
          }

          return Array.from(results);
     }

     private filterObject(obj: Object3D, segment: QuerySegment): Object3D[] {
          const matches: Object3D[] = [];

          if (this.objectMatchesSegment(obj, segment)) {
               matches.push(obj);
          }

          if (!segment.isDirectChild) {
               obj.traverse(child => {
                    if (child !== obj && this.objectMatchesSegment(child, segment)) {
                         matches.push(child);
                    }
               });
          } else {
               obj.children.forEach(child => {
                    if (this.objectMatchesSegment(child, segment)) {
                         matches.push(child);
                    }
               });
          }

          return matches;
     }

     private objectMatchesSegment(obj: Object3D, segment: QuerySegment): boolean {
          if (segment.type && obj.type !== segment.type) {
               return false;
          }
          if (segment.name && obj.name !== segment.name) {
               return false;
          }
          if (segment.uuid && obj.uuid !== segment.uuid) {
               return false;
          }

          return true;
     }

     private getAllDescendants(objects: Object3D[]): Object3D[] {
          const descendants: Object3D[] = [];
          objects.forEach(obj => {
               obj.traverse(child => {
                    if (child !== obj) {
                         descendants.push(child);
                    }
               });
          });
          return descendants;
     }

     public clearCache(): void {
          this.cache.clear();
     }
}

