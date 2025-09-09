# Key Implementation Differences: Immer vs. The Three Alternatives

Based on my analysis of all four libraries' source code, here are the major implementation differences beyond the freezing behavior:

## **1. Finalization Strategy: Full Tree Traversal vs. Selective Processing**

**Immer**: Uses **full tree traversal** during finalization

- [`finalize()`](src/core/finalize.ts:55) recursively visits every node in modified subtrees
- [`finalizeProperty()`](src/core/finalize.ts:122) processes each property individually
- **Performance cost**: Must traverse entire modified tree structure

**Alternatives**: Use **selective/optimized finalization**

- **Mutative**: [`operated` flag](../mutative/src/interface.ts:39) + callback-based finalization only processes modified branches
- **Structura**: [`walkParents()`](../structura.js/src/internals/walkParents.ts:31) propagates changes up parent chain, no full traversal
- **Limu**: [`extractFinalData()`](../limu/src/core/scope.ts:151) + [`clearScopes()`](../limu/src/core/scope.ts:36) only processes tracked scopes

## **2. Proxy Creation Strategy: Eager vs. Lazy**

**Immer**: **Eager proxy creation**

- [`createProxy()`](src/core/immerClass.ts:222) creates proxies immediately when accessed
- Every draftable child becomes a proxy on first access
- **Memory overhead**: More proxies created upfront

**Alternatives**: **Lazy proxy creation**

- **Mutative**: [`ensureShallowCopy()`](../mutative/src/utils/copy.ts:91) + [`createDraft()`](../mutative/src/draft.ts:221) only when modification occurs
- **Structura**: [`createProxy()`](../structura.js/src/proxy/createProxy.ts:20) with parent tracking, reuses existing proxies
- **Limu**: [`getMayProxiedVal()`](../limu/src/core/helper.ts:52) creates proxies lazily only when accessed

## **3. Change Tracking Mechanism: Object-based vs. Map-based vs. Parent-tracking**

**Immer**: **Object-based tracking**

- [`assigned_` object](src/core/proxy.ts:24) tracks property modifications
- [`modified_` boolean](src/core/proxy.ts:62) flags for change detection
- **Limitation**: Object property enumeration overhead

**Mutative**: **Map-based tracking**

- [`assignedMap` Map](../mutative/src/interface.ts:49) for efficient property tracking
- [`operated` flag](../mutative/src/interface.ts:39) for branch-level change detection
- **Advantage**: O(1) property lookup, more efficient than object enumeration

**Structura**: **Parent-child relationship tracking**

- [`ParentMap`](../structura.js/src/proxy/createProxy.ts:18) tracks parent-child relationships
- [`LinkMap`](../structura.js/src/proxy/createProxy.ts:17) tracks specific property links
- **Advantage**: Handles circular references and multiple references automatically

**Limu**: **Multi-path tracking**

- [`keyPaths` arrays](../limu/src/core/meta.ts:62) track multiple paths to same object
- [`MRDSid2PathsList`](../limu/src/core/meta.ts:24) for multi-reference data
- **Advantage**: Comprehensive multi-reference handling

## **4. Copy Strategy: Immediate vs. Lazy vs. Conditional**

**Immer**: **Immediate shallow copy**

- [`prepareCopy()`](src/core/proxy.ts:281) creates copy immediately on first modification
- [`shallowCopy()`](src/utils/common.ts:186) with strict/sloppy modes
- **Cost**: Upfront copying cost

**Mutative**: **Lazy copying with caching**

- [`ensureShallowCopy()`](../mutative/src/utils/copy.ts:91) only copies when needed
- [`draftsCache` WeakSet](../mutative/src/draft.ts:36) for fast draft detection
- **Optimization**: Avoids unnecessary copying

**Structura**: **Lazy cloning with type-specific optimization**

- [`shallowClone()`](../structura.js/src/internals/copy.ts:66) with type-specific functions
- [`cloneFns` dictionary](../structura.js/src/internals/copy.ts:72) for optimized copying per type
- **Optimization**: Type-specific copying strategies

**Limu**: **Conditional copying based on mode**

- [`mayMakeCopy()`](../limu/src/core/copy.ts:95) respects `immutBase`/`readOnly` flags
- [`tryMakeCopy()`](../limu/src/core/copy.ts:71) skips copying in readOnly mode
- **Optimization**: Conditional copying based on usage mode

## **5. Scope Management: Single Scope vs. Multi-scope vs. Context-based**

**Immer**: **Single scope per produce call**

- [`ImmerScope`](src/core/scope.ts:14) tracks single produce operation
- [`enterScope()`](src/core/scope.ts:71)/[`leaveScope()`](src/core/scope.ts:65) for scope management
- **Limitation**: Simple but less flexible

**Mutative**: **Finalities-based cleanup**

- [`Finalities`](../mutative/src/interface.ts:31) with `draft`, `revoke`, `handledSet` arrays
- Callback-based finalization system
- **Advantage**: More efficient cleanup coordination

**Structura**: **WeakMap-based data storage**

- [`AllData` WeakMap](../structura.js/src/proxy/createProxy.ts:5) for automatic garbage collection
- No explicit scope management needed
- **Advantage**: Automatic memory management

**Limu**: **Version-scoped contexts**

- [`ROOT_CTX` Map](../limu/src/core/meta.ts:28) with version-based scoping
- [`metaVer`](../limu/src/core/build-limu-apis.ts:101) for context isolation
- **Advantage**: Multiple concurrent draft contexts

## **6. Collection Handling: Plugin-based vs. Integrated vs. Method Replacement**

**Immer**: **Plugin-based architecture**

- [`getPlugin("MapSet")`](src/core/immerClass.ts:228) for Map/Set support
- Separate plugin system for different collection types
- **Trade-off**: Modular but adds complexity

**Mutative**: **Integrated collection support**

- [`DraftType` enum](../mutative/src/interface.ts:3) with built-in Map/Set/Array support
- [`setHandler`](../mutative/src/set.ts)/[`mapHandler`](../mutative/src/map.ts) for method interception
- **Advantage**: Built-in, no plugin system needed

**Structura**: **Method binding in proxy handler**

- [`CreateProxyHandler`](../structura.js/src/proxy/proxyHandler.ts:33) handles all collection types
- Method binding for Map/Set/Date operations in single handler
- **Advantage**: Unified handling in proxy system

**Limu**: **Method replacement strategy**

- [`replaceSetOrMapMethods()`](../limu/src/core/helper.ts:149) replaces collection methods
- [`proxyItems` generation](../limu/src/core/helper.ts:99) for collection items
- **Advantage**: Direct method interception

## **7. Performance Optimization Focus**

**Immer**: **Correctness and safety first**

- Comprehensive error checking and validation
- Full tree traversal ensures correctness
- **Trade-off**: Performance for safety and completeness

**Mutative**: **Selective processing optimization**

- [`operated` flag](../mutative/src/interface.ts:39) avoids processing unmodified branches
- [`handledSet`](../mutative/src/interface.ts:34) prevents duplicate processing
- **Focus**: Minimize processing overhead

**Structura**: **Compile-time optimization**

- TypeScript-based freezing avoids runtime overhead
- Parent-tracking eliminates need for full traversal
- **Focus**: Compile-time safety, runtime performance

**Limu**: **Lazy everything approach**

- Shallow copy on read, mark modified on write
- Lazy proxy creation, lazy copying
- **Focus**: Minimize upfront costs

## **Summary**

The three alternatives achieve their performance improvements through fundamentally different architectural approaches:

1. **Selective processing** instead of full tree traversal
2. **Lazy operations** instead of eager proxy/copy creation
3. **Efficient data structures** (Maps vs Objects, WeakMaps, etc.)
4. **Optimized change tracking** (flags, parent-tracking, multi-path)
5. **Conditional operations** based on usage patterns
6. **Integrated collection support** instead of plugin architecture

These differences explain why all three alternatives claim significant performance improvements over Immer while maintaining similar API compatibility.
