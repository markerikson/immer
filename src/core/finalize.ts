import {
	ImmerScope,
	DRAFT_STATE,
	isDraftable,
	NOTHING,
	PatchPath,
	each,
	has,
	freeze,
	ImmerState,
	isDraft,
	SetState,
	set,
	ArchType,
	getPlugin,
	die,
	revokeScope,
	isFrozen,
	isMap,
	prepareCopy
} from "../internal"

export function processResult(result: any, scope: ImmerScope) {
	scope.unfinalizedDrafts_ = scope.drafts_.length
	const baseDraft = scope.drafts_![0]
	const isReplaced = result !== undefined && result !== baseDraft
	if (isReplaced) {
		if (baseDraft[DRAFT_STATE].modified_) {
			revokeScope(scope)
			die(4)
		}
		if (isDraftable(result)) {
			// Finalize the result in case it contains (or is) a subset of the draft.
			result = finalizeAlternate(scope, result)
			if (!scope.parent_) maybeFreeze(scope, result)
		}
		if (scope.patches_) {
			getPlugin("Patches").generateReplacementPatches_(
				baseDraft[DRAFT_STATE].base_,
				result,
				scope.patches_,
				scope.inversePatches_!
			)
		}
	} else {
		// Finalize the base draft.
		result = finalizeAlternate(scope, baseDraft, [])
	}
	revokeScope(scope)
	if (scope.patches_) {
		scope.patchListener_!(scope.patches_, scope.inversePatches_!)
	}
	return result !== NOTHING ? result : undefined
}

function finalizeAlternate(
	rootScope: ImmerScope,
	value: any,
	path?: PatchPath
) {
	// Don't recurse in tho recursive data structures
	if (isFrozen(value)) return value

	const state: ImmerState = value[DRAFT_STATE]
	// A plain object, might need freezing, might contain drafts
	if (!state) {
		// Initialize handledSet if not present
		if (!rootScope.handledSet_) {
			rootScope.handledSet_ = new WeakSet()
		}
		// REPLACE tree traversal with enhanced non-draft handling
		handleNonDraftValue(value, rootScope.handledSet_, rootScope)
		return value
	}
	// Never finalize drafts owned by another scope - PRESERVE
	if (state.scope_ !== rootScope) return value
	// Unmodified draft, return the (frozen) original - PRESERVE
	if (!state.modified_) {
		maybeFreeze(rootScope, state.base_, true)
		return state.base_
	}
	// REPLACE: Not finalized yet, use callback-based finalization
	if (!state.finalized_) {
		// Use callback-based finalization instead of tree traversal
		return finalizeWithCallbacksIntegrated(rootScope, state, path)
	}
	return state.copy_
}

function finalizeWithCallbacksIntegrated(
	rootScope: ImmerScope,
	state: ImmerState,
	path?: PatchPath
): any {
	// Mark as finalized and decrement counter (preserve existing logic)
	state.finalized_ = true
	state.scope_.unfinalizedDrafts_--

	// Execute all registered callbacks (NEW: callback-based finalization)
	if (state.callbacks_) {
		while (state.callbacks_.length > 0) {
			const callback = state.callbacks_.pop()!
			callback()
		}
	}

	// Get the result copy
	const result = state.copy_

	// Handle Set finalization (preserve existing logic but without finalizeProperty)
	if (state.type_ === ArchType.Set) {
		const resultEach = new Set(result)
		result.clear()
		resultEach.forEach(value => {
			if (isDraft(value)) {
				// Use callback-based finalization instead of finalizeProperty
				const finalizedValue = finalizeAlternate(rootScope, value)
				result.add(finalizedValue)
			} else {
				result.add(value)
			}
		})
	}

	// Handle non-draft objects that might contain drafts (REPLACES finalizeProperty)
	if (!rootScope.handledSet_) {
		rootScope.handledSet_ = new WeakSet()
	}
	if (result) {
		handleNonDraftValue(result, rootScope.handledSet_, rootScope)
	}

	// Preserve existing freezing logic
	maybeFreeze(rootScope, result, false)

	// Preserve existing patch generation logic
	if (path && rootScope.patches_) {
		getPlugin("Patches").generatePatches_(
			state,
			path,
			rootScope.patches_,
			rootScope.inversePatches_!
		)
	}

	return result
}

function finalize(rootScope: ImmerScope, value: any, path?: PatchPath) {
	// Don't recurse in tho recursive data structures
	if (isFrozen(value)) return value

	const state: ImmerState = value[DRAFT_STATE]
	// A plain object, might need freezing, might contain drafts
	if (!state) {
		each(
			value,
			(key, childValue) =>
				finalizeProperty(rootScope, state, value, key, childValue, path),
			rootScope.immer_.shouldUseStrictIteration(value)
		)
		return value
	}
	// Never finalize drafts owned by another scope.
	if (state.scope_ !== rootScope) return value
	// Unmodified draft, return the (frozen) original
	if (!state.modified_) {
		maybeFreeze(rootScope, state.base_, true)
		return state.base_
	}
	// Not finalized yet, let's do that now
	if (!state.finalized_) {
		state.finalized_ = true
		state.scope_.unfinalizedDrafts_--
		const result = state.copy_
		// Finalize all children of the copy
		// For sets we clone before iterating, otherwise we can get in endless loop due to modifying during iteration, see #628
		// To preserve insertion order in all cases we then clear the set
		// And we let finalizeProperty know it needs to re-add non-draft children back to the target
		let resultEach = result
		let isSet = false
		if (state.type_ === ArchType.Set) {
			resultEach = new Set(result)
			result.clear()
			isSet = true
		}
		each(
			resultEach,
			(key, childValue) =>
				finalizeProperty(
					rootScope,
					state,
					result,
					key,
					childValue,
					path,
					isSet
				),
			rootScope.immer_.shouldUseStrictIteration(resultEach)
		)
		// everything inside is frozen, we can freeze here
		maybeFreeze(rootScope, result, false)
		// first time finalizing, let's create those patches
		if (path && rootScope.patches_) {
			getPlugin("Patches").generatePatches_(
				state,
				path,
				rootScope.patches_,
				rootScope.inversePatches_!
			)
		}
	}
	return state.copy_
}

function finalizeProperty(
	rootScope: ImmerScope,
	parentState: undefined | ImmerState,
	targetObject: any,
	prop: string | number,
	childValue: any,
	rootPath?: PatchPath,
	targetIsSet?: boolean
) {
	if (childValue == null) {
		return
	}

	if (typeof childValue !== "object" && !targetIsSet) {
		return
	}
	const childIsFrozen = isFrozen(childValue)
	if (childIsFrozen && !targetIsSet) {
		return
	}

	if (process.env.NODE_ENV !== "production" && childValue === targetObject)
		die(5)
	if (isDraft(childValue)) {
		const path =
			rootPath &&
			parentState &&
			parentState!.type_ !== ArchType.Set && // Set objects are atomic since they have no keys.
			!has((parentState as Exclude<ImmerState, SetState>).assigned_!, prop) // Skip deep patches for assigned keys.
				? rootPath!.concat(prop)
				: undefined
		// Drafts owned by `scope` are finalized here.
		const res = finalize(rootScope, childValue, path)
		set(targetObject, prop, res)
		// Drafts from another scope must prevented to be frozen
		// if we got a draft back from finalize, we're in a nested produce and shouldn't freeze
		if (isDraft(res)) {
			rootScope.canAutoFreeze_ = false
		} else return
	} else if (targetIsSet) {
		targetObject.add(childValue)
	}
	// Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
	if (isDraftable(childValue) && !childIsFrozen) {
		if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
			// optimization: if an object is not a draft, and we don't have to
			// deepfreeze everything, and we are sure that no drafts are left in the remaining object
			// cause we saw and finalized all drafts already; we can stop visiting the rest of the tree.
			// This benefits especially adding large data tree's without further processing.
			// See add-data.js perf test
			return
		}
		if (
			parentState &&
			parentState.base_ &&
			parentState.base_[prop] === childValue &&
			childIsFrozen
		) {
			// Object is unchanged from base - no need to process further
			return
		}
		finalize(rootScope, childValue)
		// Immer deep freezes plain objects, so if there is no parent state, we freeze as well
		// Per #590, we never freeze symbolic properties. Just to make sure don't accidentally interfere
		// with other frameworks.
		if (
			(!parentState || !parentState.scope_.parent_) &&
			typeof prop !== "symbol" &&
			(isMap(targetObject)
				? targetObject.has(prop)
				: Object.prototype.propertyIsEnumerable.call(targetObject, prop))
		)
			maybeFreeze(rootScope, childValue)
	}
}

function maybeFreeze(scope: ImmerScope, value: any, deep = false) {
	// we never freeze for a non-root scope; as it would prevent pruning for drafts inside wrapping objects
	if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
		freeze(value, deep)
	}
}

export function registerChildFinalizationCallback(
	rootScope: ImmerScope,
	parent: ImmerState,
	child: ImmerState,
	key: string | number | symbol
) {
	if (!parent.callbacks_) {
		parent.callbacks_ = []
	}

	parent.callbacks_.push(() => {
		// Get current value from parent's copy
		const parentCopy = parent.copy_ || parent.base_
		const currentValue = parentCopy[key]

		// Check if it's still our child draft
		if (currentValue && currentValue[DRAFT_STATE] === child) {
			// Determine final value based on child's operated status
			let finalValue
			if (child.operated_) {
				// Child was modified, use finalized copy
				finalValue = finalizeWithCallbacks(child, rootScope)
			} else {
				// Child was not modified, use original
				finalValue = child.base_
			}

			// Update parent's copy with finalized value
			if (!parent.copy_) {
				prepareCopy(parent)
			}
			parent.copy_![key] = finalValue
		}
	})
}

export function finalizeWithCallbacks(
	state: ImmerState,
	rootScope: ImmerScope
): any {
	// Early return for unmodified drafts
	if (!state.operated_) {
		return state.base_
	}

	// Prevent double finalization
	if (state.finalized_) {
		return state.copy_
	}

	// Execute all registered callbacks
	if (state.callbacks_) {
		while (state.callbacks_.length > 0) {
			const callback = state.callbacks_.pop()!
			callback()
		}
	}

	// Mark as finalized
	state.finalized_ = true

	// Handle non-draft objects that might contain drafts
	if (state.copy_) {
		handleNonDraftValue(state.copy_, state.scope_.handledSet_, rootScope)
	}

	return state.copy_ || state.base_
}

function handleNonDraftValue(
	target: any,
	handledSet: WeakSet<any>,
	rootScope: ImmerScope
) {
	// Skip if already handled, frozen, or not draftable
	if (handledSet.has(target) || isFrozen(target) || !isDraftable(target)) {
		return
	}

	handledSet.add(target)

	each(target, (key, value) => {
		if (isDraft(value)) {
			const valueDraft = value[DRAFT_STATE]
			if (valueDraft.scope_ === rootScope) {
				// Replace draft with finalized value
				let finalizedValue
				if (valueDraft.operated_) {
					finalizedValue = finalizeWithCallbacks(valueDraft, rootScope)
				} else {
					finalizedValue = valueDraft.base_
				}
				target[key] = finalizedValue
			}
		} else if (isDraftable(value)) {
			// Recursively handle nested objects
			handleNonDraftValue(value, handledSet, rootScope)
		}
	})
}
