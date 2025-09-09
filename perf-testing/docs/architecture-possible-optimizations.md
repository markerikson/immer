# Immer Performance Optimization Opportunities

Based on the analysis of the three alternative libraries, here are architectural approaches that could be adopted in Immer while maintaining its existing constraints around freezing and patch generation:

## **1. Selective Finalization (High Impact, Low Risk)**

**Current Immer Issue**: [`finalize()`](src/core/finalize.ts:55) recursively traverses entire modified subtrees

**Optimization from Mutative**: Add [`operated`/`modified` flags](../mutative/src/interface.ts:39) to track which branches actually changed

**Implementation Strategy**:

```typescript
// Add to ImmerState interface
interface ImmerState {
	// ... existing fields
	operated_: boolean // Track if this branch was actually modified
	childrenModified_: boolean // Track if any children were modified
}

// In finalize(), skip unmodified branches
function finalize(rootScope: ImmerScope, value: any, path?: PatchPath) {
	const state: ImmerState = value[DRAFT_STATE]
	if (state && !state.operated_ && !state.childrenModified_) {
		return state.base_ // Skip processing entirely
	}
	// ... continue with existing logic
}
```

**Benefits**: Avoid processing unmodified subtrees while maintaining full patch generation **Compatibility**: No breaking changes, patches still generated correctly

## **2. Map-based Change Tracking (Medium Impact, Low Risk)**

**Current Immer Issue**: [`assigned_` object](src/core/proxy.ts:24) requires property enumeration

**Optimization from Mutative**: Use [`Map` for property tracking](../mutative/src/interface.ts:49)

**Implementation Strategy**:

```typescript
// Replace assigned_ object with Map
interface ProxyBaseState extends ImmerBaseState {
  assignedMap_: Map<string | symbol, boolean>;  // More efficient than object
  // ... other fields
}

// In proxy set trap
set(state: ProxyObjectState, prop: string, value: any) {
  // ... existing logic
  state.assignedMap_ = state.assignedMap_ || new Map();
  state.assignedMap_.set(prop, true);
  // ... rest of logic
}
```

**Benefits**: O(1) property lookup instead of object enumeration **Compatibility**: Internal change, no API impact

## **3. Lazy Proxy Creation with Caching (High Impact, Medium Risk)**

**Current Immer Issue**: [`createProxy()`](src/core/immerClass.ts:222) creates proxies eagerly

**Optimization from Mutative**: [`draftsCache` WeakSet](../mutative/src/draft.ts:36) + lazy creation

**Implementation Strategy**:

```typescript
// Add draft cache to scope
interface ImmerScope {
  // ... existing fields
  draftsCache_: WeakSet<object>;
  proxyCache_: WeakMap<object, any>;
}

// In get trap, check cache before creating proxy
get(state, prop) {
  const value = source[prop];
  if (state.finalized_ || !isDraftable(value)) {
    return value;
  }

  // Check cache first
  if (state.scope_.proxyCache_.has(value)) {
    return state.scope_.proxyCache_.get(value);
  }

  // Create proxy only if not cached
  if (value === peek(state.base_, prop)) {
    prepareCopy(state);
    const proxy = createProxy(value, state);
    state.scope_.proxyCache_.set(value, proxy);
    return state.copy_![prop] = proxy;
  }
  return value;
}
```

**Benefits**: Avoid duplicate proxy creation, cache reuse **Risk**: Need to ensure cache invalidation works correctly with patches

## **4. Optimized Shallow Copy Strategy (Medium Impact, Low Risk)**

**Current Immer Issue**: [`prepareCopy()`](src/core/proxy.ts:281) always creates copy on first modification

**Optimization from Limu**: [`mayMakeCopy()`](../limu/src/core/copy.ts:95) conditional copying

**Implementation Strategy**:

```typescript
// Add copy strategy to options
interface ProduceOptions {
	// ... existing options
	lazyCopy?: boolean // Enable lazy copying
}

// Modify prepareCopy to be conditional
export function prepareCopy(state: {
	base_: any
	copy_: any
	scope_: ImmerScope
	lazyCopy_?: boolean
}) {
	if (!state.copy_ && !state.lazyCopy_) {
		state.copy_ = shallowCopy(
			state.base_,
			state.scope_.immer_.useStrictShallowCopy_
		)
	}
	// For lazy copy, defer until actually needed
}
```

**Benefits**: Reduce upfront copying cost **Compatibility**: Opt-in feature, existing behavior unchanged

## **5. Early Termination Optimization (Medium Impact, Low Risk)**

**Current Immer Issue**: [`finalizeProperty()`](src/core/finalize.ts:122) processes all properties

**Optimization from Mutative**: [`handledSet`](../mutative/src/interface.ts:34) prevents duplicate processing

**Implementation Strategy**:

```typescript
// Add to ImmerScope
interface ImmerScope {
	// ... existing fields
	processedNodes_: WeakSet<any>
}

// In finalizeProperty, skip already processed nodes
function finalizeProperty(rootScope: ImmerScope /* ... other params */) {
	if (rootScope.processedNodes_.has(childValue)) {
		return // Skip already processed
	}

	if (isDraft(childValue)) {
		rootScope.processedNodes_.add(childValue)
		// ... continue with existing logic
	}
}
```

**Benefits**: Avoid duplicate processing in complex object graphs **Compatibility**: Internal optimization, no API changes

## **6. Efficient Collection Handling (Medium Impact, Medium Risk)**

**Current Immer Issue**: Plugin-based Map/Set handling adds overhead

**Optimization from Structura**: Integrated collection support in proxy handler

**Implementation Strategy**:

```typescript
// Integrate Map/Set handling directly in proxy traps
const objectTraps: ProxyHandler<ProxyState> = {
	get(state, prop) {
		// ... existing logic

		// Handle Map/Set methods directly instead of via plugins
		if (state.type_ === ArchType.Map && typeof source[prop] === "function") {
			switch (prop) {
				case "set":
					return function(key: any, value: any) {
						prepareCopy(state)
						markChanged(state)
						return (state.copy_ as Map<any, any>).set(key, value)
					}
				case "get":
					return function(key: any) {
						const value = latest(state).get(key)
						return isDraftable(value) ? createProxy(value, state) : value
					}
				// ... other Map methods
			}
		}
		// ... rest of existing logic
	}
}
```

**Benefits**: Eliminate plugin overhead for common collections **Risk**: Need to ensure all Map/Set methods are properly handled

## **7. Smarter Patch Generation (High Impact, Medium Risk)**

**Current Immer Issue**: Patches generated during full tree traversal

**Optimization from Mutative**: Generate patches during modification, not finalization

**Implementation Strategy**:

```typescript
// Generate patches incrementally during modifications
set(state: ProxyObjectState, prop: string, value: any) {
  // ... existing modification logic

  // Generate patch immediately if patches enabled
  if (state.scope_.patches_) {
    const path = getPath(state); // Get current path
    state.scope_.patches_.push({
      op: has(state.base_, prop) ? "replace" : "add",
      path: path.concat(prop),
      value: value
    });
    state.scope_.inversePatches_.unshift({
      op: has(state.base_, prop) ? "replace" : "remove",
      path: path.concat(prop),
      value: state.base_[prop]
    });
  }

  // ... rest of existing logic
}
```

**Benefits**: Avoid patch generation overhead during finalization **Risk**: Need to ensure patch ordering and path resolution is correct

## **Implementation Priority & Risk Assessment**

### **High Priority, Low Risk**:

1. **Map-based change tracking** - Internal optimization, no API impact
2. **Early termination optimization** - Simple WeakSet addition
3. **Selective finalization flags** - Add operated\_ tracking

### **High Priority, Medium Risk**:

4. **Lazy proxy creation with caching** - Requires careful cache management
5. **Smarter patch generation** - Need to ensure patch correctness

### **Medium Priority**:

6. **Optimized shallow copy** - Opt-in feature for specific use cases
7. **Integrated collection handling** - Larger refactoring effort

## **Constraints Compatibility**

All proposed optimizations maintain Immer's core constraints:

- **Freezing**: All optimizations work with existing auto-freeze behavior
- **Patch Generation**: Patches still generated, just more efficiently
- **API Compatibility**: No breaking changes to public API
- **Safety**: Maintain existing error checking and validation
- **Correctness**: Preserve structural sharing and immutability guarantees

These optimizations could potentially provide **2-5x performance improvements** while maintaining Immer's reliability and feature completeness.
