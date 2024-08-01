# three-query-selector

`three-query-selector` is a powerful and flexible library for querying and selecting objects in Three.js scenes. It provides an intuitive, CSS-like selector syntax to easily find and manipulate 3D objects in your Three.js projects.

## Features

- CSS-like selector syntax for Three.js objects
- Support for querying by object type, name, and UUID
- Ability to select direct children or all descendants
- Caching mechanism for improved performance on repeated queries
- Lightweight and easy to integrate into existing Three.js projects

## Installation

```bash
npm install three-query-selector
# or
yarn add three-query-selector
# or
pnpm add three-query-selector
# or
bun add three-query-selector
```

## Usage

First, import the `QuerySelector` class:

```typescript
import { QuerySelector } from "three-query-selector";
```

Then, create an instance of `QuerySelector` with your Three.js scene or object array:

```typescript
const scene = new THREE.Scene();
// ... add objects to your scene

const engine = new QuerySelector([scene]);
```

Now you can use the engine to query objects:

```typescript
// Find all Mesh objects
const allMeshes = engine.get("Mesh");

// Find objects by name
const namedObject = engine.get("[name='MySpecialObject']");

// Find direct children
const directChildren = engine.get("Scene > Group");

// Find descendants
const allLights = engine.get("Scene Light");

// Complex queries
const specificMesh = engine.get("Group[name='MyGroup'] > Mesh");
```

## Query Syntax

- `TypeName`: Selects objects by their Three.js type (e.g., 'Mesh', 'Light', 'Group')
- `[name='ObjectName']`: Selects objects by their name
- `[uuid='ObjectUUID']`: Selects objects by their UUID
- `>`: Selects direct children
- Space: Selects all descendants

You can combine these to create complex queries.

## API

### `QuerySelector`

#### Constructor

```typescript
constructor(objects: Object3D[])
```

Creates a new QuerySelector instance with the given array of Three.js objects.

#### Methods

- `get(query: string): Object3D[]`
  Executes the query and returns an array of matching Three.js objects.

- `clearCache(): void`
  Clears the internal cache of query results.

## Examples

```typescript
// Find all Mesh objects that are direct children of a Group named 'MyGroup'
const meshes = engine.get("Group[name='MyGroup'] > Mesh");

// Find all Light objects anywhere in the scene
const lights = engine.get("Scene Light");

// Find a specific object by UUID
const specific = engine.get("[uuid='1234-5678-90ab-cdef']");
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
