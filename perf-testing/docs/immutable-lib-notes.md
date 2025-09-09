I've completed a comprehensive analysis of all four proxy-based immutable update libraries based on their documentation and READMEs. Here's the summary of what each library claims about itself:

## **Immer** - The Original

### Main API

- **Core**: [`produce(baseState, recipe)`](website/docs/produce.mdx:36) - The foundational API
- **Async**: [`createDraft()`](website/docs/api.md:16) and [`finishDraft()`](website/docs/api.md:21) for async operations
- **Patches**: [`produceWithPatches()`](website/docs/api.md:31) and [`applyPatches()`](website/docs/api.md:13)
- **Utilities**: [`current()`](website/docs/api.md:17), [`original()`](website/docs/api.md:29), [`isDraft()`](website/docs/api.md:26), [`nothing`](website/docs/api.md:28)

### Key Features

- **Size**: 3KB gzipped
- **Freezing**: Auto-freeze enabled by default for development safety
- **Structural sharing**: Unchanged parts of data tree are shared
- **JSON Patch support**: Full patches/inverse patches support
- **TypeScript**: Strong typing with [`Draft<T>`](website/docs/api.md:18) and [`Immutable<T>`](website/docs/api.md:25)

### Performance Claims

- Acknowledges being ["roughly speaking twice to three times slower as a handwritten reducer"](website/docs/performance.mdx:65)
- Claims to sometimes be ["significantly faster than a hand written reducer"](website/docs/performance.mdx:57) due to no-op detection
- ["Roughly as fast as ImmutableJS"](website/docs/performance.mdx:66)

---

## **Mutative** - The Performance-Focused Alternative

### Main API

- **Core**: [`create(baseState, recipe, options)`](../mutative/README.md:216) - Similar to Immer's produce
- **Patches**: [`apply(state, patches, options)`](../mutative/README.md:337)
- **Utilities**: [`current()`](../mutative/README.md:389), [`original()`](../mutative/README.md:409), [`unsafe()`](../mutative/README.md:426), [`isDraft()`](../mutative/README.md:453), [`rawReturn()`](../mutative/README.md:485)
- **Advanced**: [`makeCreator()`](../mutative/README.md:536), [`markSimpleObject()`](../mutative/README.md:556)

### Key Features & Differences from Immer

- **No data freeze by default** - Major performance advantage
- **Strict mode** - Optional development-time safety
- **Custom shallow copy** support
- **Non-invasive marking** for mutable/immutable data
- **Async draft functions** support
- **Complete freeze data** when enabled
- **Fully compatible with JSON Patch spec**

### Performance Claims

- **"10x faster than Immer"** by default configuration
- **"2-6x faster than naive handcrafted reducer"**
- **"Up to 2.5X-82.9X faster than Immer"** across different scenarios
- Claims **17x performance gap** between Mutative (6,747 ops/sec) and Immer (394 ops/sec) with default configs
- **"More than 50x"** performance lead when Immer's auto-freeze is disabled

---

## **Structura.js** - The Compile-Time Optimized

### Main API

- **Core**: [`produce(state, recipe)`](../structura.js/docs/why-structura.md:80) - Identical syntax to Immer
- **Features**: Maps, Sets, and patches support (always enabled)
- **TypeScript**: Compile-time freezing instead of runtime [`Object.freeze()`](../structura.js/docs/why-structura.md:86)

### Key Features & Differences

- **Compile-time freezing** - Uses TypeScript for immutability instead of runtime freezing
- **Circular references** - Automatic handling without manual intervention
- **Multiple references** - Supports objects referenced multiple times
- **Return + modify** - Can return values while modifying draft
- **Transpositions** - Supports reassigning object keys
- **Alpha state** - APIs may change

### Performance Claims

- **"Up to ~10x more performant"** than Immer
- **"Even faster than Immutable"** in most cases
- Claims to be **"~10x more performant"** while being "indistinguishable from the immer" API
- Provides detailed benchmark charts across different scenarios (complex/nested/simple objects with many/few modifications)

---

## **Limu** - The Debugging-Friendly Speed Demon

### Main API

- **Core**: [`produce(baseState, recipe)`](../limu/README.md:74) - Standard produce function
- **Manual**: [`createDraft()`](../limu/README.md:98) and [`finishDraft()`](../limu/README.md:101)
- **Currying**: Supports curried [`produce(recipe)(baseState)`](../limu/README.md:87)

### Key Features & Differences

- **No freeze by default** - Major performance advantage
- **Debugging friendly** - Can view draft directly without [`current()`](../limu/README.md:15)
- **Smaller package** - Only 4.3KB gzipped
- **Natural Map and Set support**
- **Shallow copy on read, mark modified on write** mechanism

### Performance Claims

- **"2 or 20 times faster than immer"** in different situations
- **"10 times or more faster than Immer"** in most scenarios
- Claims to be **"now the fastest immutable js lib of all (faster than immer and mutative)"** as of v3.7+
- Provides benchmark comparisons showing significant performance advantages

---

## **How They Compare to Each Other**

### **Performance Hierarchy** (based on their claims):

1. **Limu** - Claims to be fastest overall, especially after v3.7
2. **Mutative** - Claims 10x+ faster than Immer, extensive benchmarking
3. **Structura.js** - Claims ~10x faster than Immer, faster than Immutable
4. **Immer** - Acknowledges being 2-3x slower than handwritten reducers

### **Key Differentiators**:

**Freezing Strategy**:

- **Immer**: Auto-freeze by default (performance cost)
- **Mutative**: No freeze by default (performance gain)
- **Limu**: No freeze by default (performance gain)
- **Structura.js**: Compile-time freezing via TypeScript

**API Compatibility**:

- **Mutative**: Includes explicit "compat" layer for Immer API matching
- **Structura.js**: "Identical syntax to Immer"
- **Limu**: Standard produce API with some debugging enhancements
- **Immer**: The reference implementation

**Special Features**:

- **Mutative**: Strict mode, custom shallow copy, async drafts
- **Structura.js**: Circular references, transpositions, return+modify
- **Limu**: Superior debugging experience, natural Map/Set support
- **Immer**: Most mature, extensive ecosystem integration

## Summary

**Immer** positions itself as the mature, stable foundation with strong ecosystem integration, acknowledging its performance trade-offs but emphasizing safety and ease of use.

**Mutative** presents itself as the high-performance drop-in replacement for Immer, claiming 10x+ performance improvements while offering additional features like strict mode and custom shallow copy support.

**Structura.js** emphasizes its unique compile-time freezing approach and superior handling of edge cases like circular references, claiming ~10x performance improvements over Immer.

**Limu** focuses on being the fastest option with superior debugging experience, claiming to be 2-20x faster than Immer and positioning itself as "the fastest immutable js lib of all."

All three alternatives (Mutative, Structura.js, Limu) share common themes in their positioning against Immer:

- **Performance**: All claim significant speed improvements (10x+ faster)
- **No freeze by default**: Avoiding Immer's runtime freezing overhead
- **API compatibility**: Maintaining familiar `produce()` function signatures
- **Size**: Generally smaller or comparable bundle sizes

The key differentiator is their approach to achieving these improvements - Mutative focuses on comprehensive feature parity with better defaults, Structura.js uses compile-time optimizations, and Limu emphasizes debugging experience and minimal overhead.
