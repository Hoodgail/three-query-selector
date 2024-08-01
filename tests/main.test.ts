import { Scene, Group, Mesh } from 'three';
import { QuerySelector } from '../src';
import { expect, test, describe, beforeEach, spyOn } from "bun:test";

describe('QuerySelector', () => {
     let engine: QuerySelector;
     let scene: Scene;

     beforeEach(() => {
          scene = new Scene();

          const group1 = new Group();
          group1.name = 'TestGroup1';

          const mesh1 = new Mesh();
          mesh1.name = 'TestMesh1';
          group1.add(mesh1);

          const group2 = new Group();
          group2.name = 'TestGroup2';

          const mesh2 = new Mesh();
          mesh2.name = 'TestMesh2';
          group2.add(mesh2);

          scene.add(group1, group2);

          engine = new QuerySelector([scene]);
     });

     test('should find objects by type', () => {
          const result = engine.get('Group');
          expect(result.length).toBe(2);
          expect(result[0].name).toBe('TestGroup1');
          expect(result[1].name).toBe('TestGroup2');
     });

     test('should find objects by name', () => {
          const result = engine.get("[name='TestMesh1']");
          expect(result.length).toBe(1);
          expect(result[0].name).toBe('TestMesh1');
     });

     test('should find direct children', () => {
          const result = engine.get("Scene > Group");
          expect(result.length).toBe(2);
     });

     test('should find descendants', () => {
          const result = engine.get("Scene Mesh");
          expect(result.length).toBe(2);
          expect(result[0].name).toBe('TestMesh1');
          expect(result[1].name).toBe('TestMesh2');
     });

     test('should handle complex queries', () => {
          const result = engine.get("Group[name='TestGroup1'] > Mesh");
          expect(result.length).toBe(1);
          expect(result[0].name).toBe('TestMesh1');
     });

     test('should throw error for empty queries', () => {
          expect(() => engine.get('')).toThrow('Invalid query');
     });

     test('should return empty array for non-matching queries', () => {
          const result = engine.get('NonexistentType');
          expect(result).toEqual([]);
     });

     test('should use cache for repeated queries', () => {
          const spy = spyOn(engine as any, 'executeQuery');

          engine.get("Group");
          engine.get("Group");

          expect(spy).toHaveBeenCalledTimes(1);
     });

     test('should clear cache', () => {
          engine.get("Group");
          engine.clearCache();

          const spy = spyOn(engine as any, 'executeQuery');
          engine.get("Group");

          expect(spy).toHaveBeenCalledTimes(1);
     });
});