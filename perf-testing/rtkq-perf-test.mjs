import "source-map-support/register.js"

process.env.NODE_ENV = "production"

import {produce} from "../dist/immer.mjs"

function createInitialState(arraySize = BENCHMARK_CONFIG.arraySize) {
	const initialState = {
		largeArray: Array.from({length: arraySize}, (_, i) => ({
			id: i,
			value: Math.random(),
			nested: {key: `key-${i}`, data: Math.random()},
			moreNested: {
				items: Array.from(
					{length: BENCHMARK_CONFIG.nestedArraySize},
					(_, i) => ({id: i, name: String(i)})
				)
			}
		})),
		otherData: Array.from({length: arraySize}, (_, i) => ({
			id: i,
			name: `name-${i}`,
			isActive: i % 2 === 0
		})),
		api: {
			queries: {},
			provided: {
				keys: {}
			},
			subscriptions: {}
		}
	}
	return initialState
}

const MAX = 1

const BENCHMARK_CONFIG = {
	iterations: 1,
	arraySize: 200,
	nestedArraySize: 100,
	multiUpdateCount: 5,
	reuseStateIterations: 10
}

// Utility functions for calculating array indices based on size
const getValidIndex = (arraySize = BENCHMARK_CONFIG.arraySize) => {
	// Return a valid index (not the last one to avoid edge cases)
	return Math.min(arraySize - 2, Math.max(0, arraySize - 2))
}

const getValidId = (arraySize = BENCHMARK_CONFIG.arraySize) => {
	// Return a valid ID that exists in the array
	return Math.min(arraySize - 2, Math.max(0, arraySize - 2))
}

const add = index => ({
	type: "test/addItem",
	payload: {id: index, value: index, nested: {data: index}}
})
const remove = index => ({type: "test/removeItem", payload: index})
const filter = index => ({type: "test/filterItem", payload: index})
const update = index => ({
	type: "test/updateItem",
	payload: {id: index, value: index, nestedData: index}
})
const concat = index => ({
	type: "test/concatArray",
	payload: Array.from({length: 500}, (_, i) => ({id: i, value: index}))
})

const updateHigh = index => ({
	type: "test/updateHighIndex",
	payload: {
		id:
			Math.floor(BENCHMARK_CONFIG.arraySize * 0.8) +
			(index % Math.floor(BENCHMARK_CONFIG.arraySize * 0.2)),
		value: index,
		nestedData: index
	}
})
const updateMultiple = index => ({
	type: "test/updateMultiple",
	payload: Array.from({length: BENCHMARK_CONFIG.multiUpdateCount}, (_, i) => ({
		id: (index + i) % BENCHMARK_CONFIG.arraySize,
		value: index + i,
		nestedData: index + i
	}))
})
const removeHigh = index => ({
	type: "test/removeHighIndex",
	payload:
		Math.floor(BENCHMARK_CONFIG.arraySize * 0.8) +
		(index % Math.floor(BENCHMARK_CONFIG.arraySize * 0.2))
})

const sortByIdReverse = () => ({
	type: "test/sortByIdReverse"
})

const reverseArray = () => ({
	type: "test/reverseArray"
})

// RTKQ-style action creators
const rtkqPending = index => ({
	type: "rtkq/pending",
	payload: {
		cacheKey: `some("test-${index}-")`,
		requestId: `req-${index}`,
		id: `test-${index}-`
	}
})

const rtkqResolved = index => ({
	type: "rtkq/resolved",
	payload: {
		cacheKey: `some("test-${index}-")`,
		requestId: `req-${index}`,
		id: `test-${index}-`,
		data: `test-${index}-1`
	}
})

const createImmerReducer = produce => {
	const immerReducer = (state = createInitialState(), action) =>
		produce(state, draft => {
			switch (action.type) {
				case "test/addItem":
					draft.largeArray.push(action.payload)
					break
				case "test/removeItem":
					draft.largeArray.splice(action.payload, 1)
					break
				case "test/filterItem": {
					draft.largeArray = draft.largeArray.filter(
						(item, i) => i !== action.payload
					)
					break
				}
				case "test/updateItem": {
					const item = draft.largeArray.find(
						item => item.id === action.payload.id
					)
					item.value = action.payload.value
					item.nested.data = action.payload.nestedData
					break
				}
				case "test/concatArray": {
					const length = state.largeArray.length
					const newArray = action.payload.concat(state.largeArray)
					newArray.length = length
					draft.largeArray = newArray
					break
				}
				case "test/updateHighIndex": {
					const item = draft.largeArray.find(
						item => item.id === action.payload.id
					)
					if (item) {
						item.value = action.payload.value
						item.nested.data = action.payload.nestedData
					}
					break
				}
				case "test/updateMultiple": {
					action.payload.forEach(update => {
						const item = draft.largeArray.find(item => item.id === update.id)
						if (item) {
							item.value = update.value
							item.nested.data = update.nestedData
						}
					})
					break
				}
				case "test/removeHighIndex": {
					const indexToRemove = draft.largeArray.findIndex(
						item => item.id === action.payload
					)
					if (indexToRemove !== -1) {
						draft.largeArray.splice(indexToRemove, 1)
					}
					break
				}
				case "test/sortByIdReverse": {
					draft.largeArray.sort((a, b) => b.id - a.id)
					break
				}
				case "test/reverseArray": {
					draft.largeArray.reverse()
					break
				}
				case "rtkq/pending": {
					// Simulate separate RTK slice reducers with combined reducer pattern
					const cacheKey = action.payload.cacheKey
					draft.api.queries[cacheKey] = {
						id: action.payload.id,
						status: "pending",
						data: undefined
					}
					draft.api.provided.keys[cacheKey] = {}
					draft.api.subscriptions[cacheKey] = {
						[action.payload.requestId]: {
							pollingInterval: 0,
							skipPollingIfUnfocused: false
						}
					}
					break
				}
				case "rtkq/resolved": {
					const cacheKey = action.payload.cacheKey
					draft.api.queries[cacheKey].status = "fulfilled"
					draft.api.queries[cacheKey].data = action.payload.data
					// provided and subscriptions don't change on resolved
					break
				}
			}
		})

	return immerReducer
}

const immer10PerfReducer = createImmerReducer(produce)

const arraySize = 1000

let state = createInitialState()

const start = performance.now()

// Phase 1: Execute all pending actions
for (let i = 0; i < arraySize; i++) {
	state = immer10PerfReducer(state, rtkqPending(i))
}

// Phase 2: Execute all resolved actions
for (let i = 0; i < arraySize; i++) {
	state = immer10PerfReducer(state, rtkqResolved(i))
}

const end = performance.now()

console.log(
	`Total time for ${arraySize} pending + ${arraySize} resolved actions: ${(
		end - start
	).toFixed(2)}ms`
)
