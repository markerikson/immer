import {
	die,
	isDraft,
	shallowCopy,
	each,
	DRAFT_STATE,
	set,
	ImmerState,
	isDraftable
} from "../internal"

/** Takes a snapshot of the current state of a draft and finalizes it (but without freezing). This is a great utility to print the current state during debugging (no Proxies in the way). The output of current can also be safely leaked outside the producer. */
export function current<T>(value: T): T
export function current(value: any): any {
	if (!isDraft(value)) die(22, value)
	return currentImpl(value)
}

function currentImpl(value: any): any {
	if (!isDraftable(value)) return value
	const state: ImmerState | undefined = value[DRAFT_STATE]
	if (!state) return value
	if (!state.modified_) return state.base_
	// Optimization: avoid generating new drafts during copying
	state.finalized_ = true
	const copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_)
	// recurse
	each(copy, (key, childValue) => {
		set(copy, key, currentImpl(childValue))
	})
	state.finalized_ = false
	return copy
}
