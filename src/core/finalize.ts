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
	get
} from "../internal"
import {debugLog} from "../internal"
import util from "util"

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

	// debugLog("Finalizing scope: ", util.inspect(rootScope, {depth: 3}), value)

	const state: ImmerState = value[DRAFT_STATE]
	// A plain object, might need freezing, might contain drafts
	if (!state) {
		debugLog("Finalizing plain object: ", value)
		const finalValue = handleValue(value, rootScope.handledSet_, rootScope)
		debugLog("New final value: ", finalValue)
		return finalValue
	}
	// Never finalize drafts owned by another scope
	if (state.scope_ !== rootScope) {
		debugLog(
			"Skipping finalization of foreign draft in scope",
			state.scope_,
			rootScope
		)
		return value
	}
	// Unmodified draft, return the (frozen) original
	if (!state.modified_) {
		debugLog("State not modified: ", state)
		maybeFreeze(rootScope, state.base_, true)
		return state.base_
	}
	// REPLACE: Not finalized yet, use callback-based finalization
	if (!state.finalized_) {
		return finalizeWithCallbacksIntegrated(rootScope, state, path)
	}

	return state.copy_
}

function finalizeWithCallbacksIntegrated(
	rootScope: ImmerScope,
	state: ImmerState,
	path?: PatchPath
): any {
	state.finalized_ = true
	state.scope_.unfinalizedDrafts_--

	// Execute all registered callbacks
	if (state.callbacks_) {
		while (state.callbacks_.length > 0) {
			const callback = state.callbacks_.pop()!
			callback()
		}
	}

	const result = state.copy_

	if (
		!rootScope.parent_ &&
		rootScope.immer_.autoFreeze_ &&
		rootScope.canAutoFreeze_
	) {
		maybeFreeze(rootScope, state.base_, true)
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

	// debugLog("Final result: ", util.inspect(result, {depth: Infinity}))

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
	parent.callbacks_.push(() => {
		const target = parent
		const parentCopy = parent.copy_ || parent.base_
		const childCopy = get(parentCopy, key)
		const state: ImmerState = child
		debugLog("Finalize callback", {key, parent, child, childCopy})

		if (!state) {
			debugLog(
				"No state found for child, skipping finalization callback.",
				key,
				child
			)
			return
		}

		// Never finalize drafts owned by another scope.
		if (state.scope_ !== rootScope) {
			debugLog(
				"Skipping finalization of foreign draft",
				key,
				state.scope_,
				rootScope
			)
			return
		}
		// Unmodified draft, return the (frozen) original
		if (!state.modified_) {
			debugLog("State not modified: ", state)
			maybeFreeze(rootScope, state.base_, true)

			const currentValue = get(parentCopy, key)
			const isMultipleReference =
				currentValue === state.draft_ && state.base_ !== currentValue

			if (isMultipleReference) {
				// Multiple reference case - revert to base object
				set(parentCopy, key, state.base_)
			}

			return
		}

		state.finalized_ = true
		state.scope_.unfinalizedDrafts_--

		let updatedValue
		if (parent.type_ === ArchType.Set) {
			// For Sets, key IS the value - use the draft's finalized copy directly
			updatedValue = state.copy_
		} else {
			// For Maps/Objects, use lookup logic
			const childCopy = get(parentCopy, key)
			updatedValue = isDraft(childCopy) ? state.copy_ : childCopy
		}

		debugLog("Callback finalizing value", {
			key,
			updatedValue,
			childCopy,
			stateCopy: state.copy_,
			parentCopy
		})

		finalizeSetValue(state)

		set(parentCopy, key, updatedValue)
	})
}

function getDraft(value: any): ImmerState | null {
	if (typeof value !== "object") return null
	return value?.[DRAFT_STATE]
}

function getValue<T extends object>(value: T): T {
	const proxyDraft = getDraft(value)
	return proxyDraft ? proxyDraft.copy_ ?? proxyDraft.base_ : value
}

export function finalizeSetValue(target: ImmerState) {
	if (target.type_ === ArchType.Set && target.copy_) {
		const copy = new Set(target.copy_)
		target.copy_.clear()
		copy.forEach(value => {
			target.copy_!.add(getValue(value))
		})
	}
}

export function handleValue(
	target: any,
	handledSet: WeakSet<any>,
	rootScope: ImmerScope
) {
	debugLog("handleValue: ", {target})
	// Skip if already handled, frozen, or not draftable
	if (
		isDraft(target) ||
		handledSet.has(target) ||
		!isDraftable(target) ||
		isFrozen(target)
	) {
		return target
	}

	if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
		// optimization: if an object is not a draft, and we don't have to
		// deepfreeze everything, and we are sure that no drafts are left in the remaining object
		// cause we saw and finalized all drafts already; we can stop visiting the rest of the tree.
		// This benefits especially adding large data tree's without further processing.
		// See add-data.js perf test
		return target
	}

	const isSet = target instanceof Set
	const isMap = target instanceof Map
	const setMap: Map<any, any> | undefined = isSet ? new Map() : undefined
	handledSet.add(target)

	// Process ALL properties/entries
	each(target, (key, value) => {
		if (isDraft(value)) {
			const valueDraft = value[DRAFT_STATE]
			if (valueDraft.scope_ === rootScope) {
				// Replace draft with finalized value

				const updatedValue = valueDraft.modified_
					? valueDraft.copy_
					: valueDraft.base_
				debugLog("Replacing draft with finalized value", {
					key,
					value,
					valueDraft,
					updatedValue
				})

				set(target, key, updatedValue)
			}
		} else if (isDraftable(value)) {
			// Recursively handle nested values
			handleValue(value, handledSet, rootScope)
		}
	})

	// For Sets, reconstruct with finalized values
	if (setMap) {
		const set = target as Set<any>
		const values = Array.from(set)
		set.clear()
		values.forEach(value => {
			set.add(setMap!.has(value) ? setMap!.get(value) : value)
		})
	}

	debugLog("handleValue - final target: ", {target})

	return target
}
