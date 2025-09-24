/* eslint-disable no-inner-declarations */
import "source-map-support/register"

import {produce as produce5, setAutoFreeze as setAutoFreeze5} from "immer5"
import {produce as produce6, setAutoFreeze as setAutoFreeze6} from "immer6"
import {produce as produce7, setAutoFreeze as setAutoFreeze7} from "immer7"
import {produce as produce8, setAutoFreeze as setAutoFreeze8} from "immer8"
import {produce as produce9, setAutoFreeze as setAutoFreeze9} from "immer9"
import {produce as produce10, setAutoFreeze as setAutoFreeze10} from "immer10"
import {
	produce as produce10Perf,
	setAutoFreeze as setAutoFreeze10Perf,
	// Uncomment when using a build of Immer that exposes this function,
	// and enable the corresponding line in the setStrictIteration object below.
	setUseStrictIteration as setUseStrictIteration10Perf
} from "immer10Perf"
import {create as produceMutative} from "mutative"
import {
	produce as produceMutativeCompat,
	setAutoFreeze as setAutoFreezeMutativeCompat
} from "mutative-compat"
import {
	produce as produceStructura,
	enableAutoFreeze as setAutoFreezeStructura
} from "structurajs"
import {produce as produceLimu, setAutoFreeze as setAutoFreezeLimu} from "limu"
import {bench, run, group, summary} from "mitata"

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
		}))
	}
	return initialState
}

const MAX = 1

const BENCHMARK_CONFIG = {
	iterations: 1,
	arraySize: 10000,
	nestedArraySize: 100,
	multiUpdateCount: 5,
	reuseStateIterations: 10
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

const actions = {
	add,
	remove,
	filter,
	update,
	concat,
	updateHigh,
	updateMultiple,
	removeHigh,
	sortByIdReverse,
	reverseArray
}

const immerProducers = {
	immer5: produce5,
	immer6: produce6,
	immer7: produce7,
	immer8: produce8,
	immer9: produce9,
	immer10: produce10,
	immer10Perf: produce10Perf,
	mutative: produceMutative,
	mutativeCompat: produceMutativeCompat,
	structura: produceStructura,
	limu: produceLimu
}

const noop = () => {}

const setAutoFreezes = {
	vanilla: noop,
	immer5: setAutoFreeze5,
	immer6: setAutoFreeze6,
	immer7: setAutoFreeze7,
	immer8: setAutoFreeze8,
	immer9: setAutoFreeze9,
	immer10: setAutoFreeze10,
	immer10Perf: setAutoFreeze10Perf,
	mutative: noop,
	mutativeCompat: setAutoFreezeMutativeCompat,
	structura: setAutoFreezeStructura,
	limu: setAutoFreezeLimu
}

const setStrictIteration = {
	vanilla: noop,
	immer5: noop,
	immer6: noop,
	immer7: noop,
	immer8: noop,
	immer9: noop,
	immer10: noop,
	immer10Perf: setUseStrictIteration10Perf,
	mutative: noop,
	mutativeCompat: noop,
	structura: noop,
	limu: noop
}

const vanillaReducer = (state = createInitialState(), action) => {
	switch (action.type) {
		case "test/addItem":
			return {
				...state,
				largeArray: [...state.largeArray, action.payload]
			}
		case "test/removeItem": {
			const newArray = state.largeArray.slice()
			newArray.splice(action.payload, 1)
			return {
				...state,
				largeArray: newArray
			}
		}
		case "test/filterItem": {
			const newArray = state.largeArray.filter(
				(item, i) => i !== action.payload
			)
			return {
				...state,
				largeArray: newArray
			}
		}
		case "test/updateItem": {
			return {
				...state,
				largeArray: state.largeArray.map(item =>
					item.id === action.payload.id
						? {
								...item,
								value: action.payload.value,
								nested: {...item.nested, data: action.payload.nestedData}
						  }
						: item
				)
			}
		}
		case "test/concatArray": {
			const length = state.largeArray.length
			const newArray = action.payload.concat(state.largeArray)
			newArray.length = length
			return {
				...state,
				largeArray: newArray
			}
		}
		case "test/updateHighIndex": {
			return {
				...state,
				largeArray: state.largeArray.map(item =>
					item.id === action.payload.id
						? {
								...item,
								value: action.payload.value,
								nested: {...item.nested, data: action.payload.nestedData}
						  }
						: item
				)
			}
		}
		case "test/updateMultiple": {
			const updates = new Map(action.payload.map(p => [p.id, p]))
			return {
				...state,
				largeArray: state.largeArray.map(item => {
					const update = updates.get(item.id)
					return update
						? {
								...item,
								value: update.value,
								nested: {...item.nested, data: update.nestedData}
						  }
						: item
				})
			}
		}
		case "test/removeHighIndex": {
			const newArray = state.largeArray.slice()
			const indexToRemove = newArray.findIndex(
				item => item.id === action.payload
			)
			if (indexToRemove !== -1) {
				newArray.splice(indexToRemove, 1)
			}
			return {
				...state,
				largeArray: newArray
			}
		}
		case "test/sortByIdReverse": {
			const newArray = state.largeArray.slice()
			newArray.sort((a, b) => b.id - a.id) // Sort by ID in reverse order
			return {
				...state,
				largeArray: newArray
			}
		}
		case "test/reverseArray": {
			const newArray = state.largeArray.slice()
			newArray.reverse()
			return {
				...state,
				largeArray: newArray
			}
		}
		default:
			return state
	}
}

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
			}
		})

	return immerReducer
}

function mapValues(obj, fn) {
	const result = {}
	for (const key in obj) {
		result[key] = fn(obj[key])
	}
	return result
}

const reducers = {
	vanilla: vanillaReducer,
	...mapValues(immerProducers, createImmerReducer)
}

const freeze = [
	// false,
	true
]

function createBenchmarks() {
	// All single-operation benchmarks (fresh state each time)
	for (const action in actions) {
		summary(function() {
			bench(`$action: $version (freeze: $freeze)`, function*(args) {
				const version = args.get("version")
				const freeze = args.get("freeze")
				const action = args.get("action")

				const initialState = createInitialState()

				function benchMethod() {
					setAutoFreezes[version](freeze)
					setStrictIteration[version](false)
					for (let i = 0; i < MAX; i++) {
						reducers[version](initialState, actions[action](i))
					}
					setAutoFreezes[version](false)
				}

				yield benchMethod
			}).args({
				version: Object.keys(reducers),
				freeze,
				action: [action]
			})
		})
	}

	// State reuse benchmarks (tests performance on frozen/evolved state)
	const reuseActions = ["update", "updateHigh", "remove", "removeHigh"]
	for (const action of reuseActions) {
		summary(function() {
			bench(`$action-reuse: $version (freeze: $freeze)`, function*(args) {
				const version = args.get("version")
				const freeze = args.get("freeze")
				const action = args.get("action")

				function benchMethod() {
					setAutoFreezes[version](freeze)
					setStrictIteration[version](false)

					let currentState = createInitialState()

					// Perform multiple operations on the same evolving state
					for (let i = 0; i < BENCHMARK_CONFIG.reuseStateIterations; i++) {
						currentState = reducers[version](currentState, actions[action](i))
					}
					setAutoFreezes[version](false)
				}

				yield benchMethod
			}).args({
				version: Object.keys(reducers),
				freeze,
				action: [action]
			})
		})
	}

	// Mixed operations sequence benchmark
	summary(function() {
		bench(`mixed-sequence: $version (freeze: $freeze)`, function*(args) {
			const version = args.get("version")
			const freeze = args.get("freeze")

			function benchMethod() {
				setAutoFreezes[version](freeze)
				setStrictIteration[version](false)

				let state = createInitialState()

				// Perform a sequence of different operations (typical workflow)
				state = reducers[version](state, actions.add(1))
				state = reducers[version](state, actions.update(500))
				state = reducers[version](state, actions.updateHigh(2))
				state = reducers[version](state, actions.updateMultiple(3))
				state = reducers[version](state, actions.remove(100))

				setAutoFreezes[version](false)
			}

			yield benchMethod
		}).args({
			version: Object.keys(reducers),
			freeze
		})
	})
}

// Summary table functionality
function extractBenchmarkData(benchmarks) {
	const data = []

	for (const trial of benchmarks) {
		for (const run of trial.runs) {
			if (run.error || !run.stats) continue

			// Parse benchmark name to extract scenario, version, and freeze setting
			// Expected format: "scenario: version (freeze: true/false)"
			const match = run.name.match(
				/^(.+?):\s*(.+?)\s*\(freeze:\s*(true|false)\)$/
			)
			if (!match) continue

			const [, scenario, version, freeze] = match
			const freezeIndicator = freeze === "true" ? "f+" : "f-"
			const versionKey = `${version.trim()}|${freezeIndicator}`

			data.push({
				scenario: scenario.trim(),
				version: version.trim(),
				freeze: freeze === "true",
				freezeIndicator,
				versionKey,
				avgTime: run.stats.avg,
				stats: run.stats
			})
		}
	}

	return data
}

function organizeBenchmarkMatrix(data) {
	const matrix = {}
	const scenarios = new Set()
	const versions = new Set()

	// Organize data into matrix structure
	for (const item of data) {
		scenarios.add(item.scenario)
		versions.add(item.versionKey)

		if (!matrix[item.scenario]) {
			matrix[item.scenario] = {}
		}

		matrix[item.scenario][item.versionKey] = {
			avgTime: item.avgTime,
			stats: item.stats
		}
	}

	return {
		matrix,
		scenarios: Array.from(scenarios).sort(),
		versions: Array.from(versions).sort()
	}
}

function calculateRelativePerformanceAndRankings(matrix, scenarios, versions) {
	const relativeData = {}
	const rankings = {}

	for (const scenario of scenarios) {
		const scenarioData = matrix[scenario] || {}
		const validVersions = versions.filter(v => scenarioData[v])

		if (validVersions.length === 0) continue

		// Find fastest time for this scenario
		const times = validVersions.map(v => ({
			version: v,
			time: scenarioData[v].avgTime
		}))

		times.sort((a, b) => a.time - b.time)
		const fastestTime = times[0].time

		// Calculate relative performance and rankings
		relativeData[scenario] = {}
		rankings[scenario] = {}

		times.forEach((item, index) => {
			const multiplier = item.time / fastestTime
			relativeData[scenario][item.version] = multiplier
			rankings[scenario][item.version] = index + 1
		})
	}

	return {relativeData, rankings}
}

function formatTime(nanoseconds) {
	// Use similar formatting to Mitata's $.time function, but more compact
	if (nanoseconds < 1) return `${(nanoseconds * 1e3).toFixed(1)}ps`
	if (nanoseconds < 1e3) return `${nanoseconds.toFixed(1)}ns`

	let ns = nanoseconds / 1000
	if (ns < 1e3) return `${ns.toFixed(1)}µs`

	ns /= 1000
	if (ns < 1e3) return `${ns.toFixed(1)}ms`

	ns /= 1000
	if (ns < 1e3) return `${ns.toFixed(1)}s`

	return `${ns.toFixed(1)}s`
}

function formatRanking(rank) {
	const suffixes = ["th", "st", "nd", "rd"]
	const suffix = rank >= 11 && rank <= 13 ? "th" : suffixes[rank % 10] || "th"
	return `${rank}${suffix}`
}

function formatMultiplier(relative) {
	if (relative === 1) return "1.0x"

	// If the multiplier is 4+ digits (1000+), don't show decimals
	if (relative >= 1000) {
		return `${Math.round(relative)}x`
	}

	return `${relative.toFixed(1)}x`
}

function shortenVersionName(versionName) {
	// Special case common long version names to save space
	const shortNames = {
		immer10Perf: "i10Perf",
		immer10: "i10",
		immer5: "i5",
		immer6: "i6",
		immer7: "i7",
		immer8: "i8",
		immer9: "i9",
		"mutative-compat": "mutatv-c",
		mutative: "mutatv",
		structura: "struct",
		vanilla: "vanilla"
	}

	return shortNames[versionName] || versionName
}

function printSummaryTable(
	matrix,
	scenarios,
	versions,
	relativeData,
	rankings
) {
	console.log("\n")
	console.log("=".repeat(80))
	console.log("BENCHMARK SUMMARY TABLE")
	console.log("=".repeat(80))

	if (scenarios.length === 0 || versions.length === 0) {
		console.log("No benchmark data available for summary table.")
		return
	}

	// Parse version keys to get version names and freeze indicators
	const versionInfo = versions.map(v => {
		const [versionName, freezeIndicator] = v.split("|")
		const shortName = shortenVersionName(versionName)
		return {
			key: v,
			name: shortName,
			freeze: freezeIndicator,
			originalName: versionName
		}
	})

	// Fixed column widths for consistent alignment - 9 chars content + separators
	const scenarioWidth = 9
	const versionWidth = 8

	// Print header with 9-char content + padding
	let header = "┌" + "─".repeat(scenarioWidth + 2)
	for (let i = 0; i < versions.length; i++) {
		header += "┬" + "─".repeat(versionWidth)
	}
	header += "┐"
	console.log(header)

	// Print column headers - version names
	let headerRow1 = "│ " + "Scenario".padEnd(scenarioWidth) + " "
	for (const vInfo of versionInfo) {
		headerRow1 += "│" + vInfo.name.padEnd(versionWidth)
	}
	headerRow1 += "│"
	console.log(headerRow1)

	// Print column headers - freeze indicators
	let headerRow2 = "│ " + "".padEnd(scenarioWidth) + " "
	for (const vInfo of versionInfo) {
		headerRow2 += "│" + vInfo.freeze.padEnd(versionWidth)
	}
	headerRow2 += "│"
	console.log(headerRow2)

	// Print separator
	let separator = "├" + "─".repeat(scenarioWidth + 2)
	for (let i = 0; i < versions.length; i++) {
		separator += "┼" + "─".repeat(versionWidth)
	}
	separator += "┤"
	console.log(separator)

	// Print data rows (now 3 lines per scenario) - tighter spacing
	for (const scenario of scenarios) {
		const scenarioData = matrix[scenario] || {}

		// Truncate scenario name if too long, allowing for wrapping
		const displayScenario =
			scenario.length > scenarioWidth
				? scenario.substring(0, scenarioWidth - 2) + ".."
				: scenario

		// First line: scenario name and absolute times
		let row1 = "│ " + displayScenario.padEnd(scenarioWidth) + " "
		for (const version of versions) {
			const data = scenarioData[version]
			let timeStr = data ? formatTime(data.avgTime) : "N/A"
			// Truncate if too long
			if (timeStr.length > versionWidth) {
				timeStr = timeStr.substring(0, versionWidth - 1) + "…"
			}
			row1 += "│" + timeStr.padEnd(versionWidth)
		}
		row1 += "│"
		console.log(row1)

		// Second line: relative performance multipliers
		let row2 = "│ " + "".padEnd(scenarioWidth) + " "
		for (const version of versions) {
			const relative = relativeData[scenario]?.[version]

			let multiplierStr = ""
			if (relative) {
				multiplierStr = formatMultiplier(relative)
			} else {
				multiplierStr = "N/A"
			}

			// Truncate if too long
			if (multiplierStr.length > versionWidth) {
				multiplierStr = multiplierStr.substring(0, versionWidth - 1) + "…"
			}

			row2 += "│" + multiplierStr.padEnd(versionWidth)
		}
		row2 += "│"
		console.log(row2)

		// Third line: rankings
		let row3 = "│ " + "".padEnd(scenarioWidth) + " "
		for (const version of versions) {
			const ranking = rankings[scenario]?.[version]

			let rankStr = ""
			if (ranking) {
				rankStr = `(${formatRanking(ranking)})`
			} else {
				rankStr = ""
			}

			row3 += "│" + rankStr.padEnd(versionWidth)
		}
		row3 += "│"
		console.log(row3)

		// Add separator between scenarios (except for last one)
		if (scenario !== scenarios[scenarios.length - 1]) {
			let rowSep = "├" + "─".repeat(scenarioWidth + 2)
			for (let i = 0; i < versions.length; i++) {
				rowSep += "┼" + "─".repeat(versionWidth)
			}
			rowSep += "┤"
			console.log(rowSep)
		}
	}

	// Print footer
	let footer = "└" + "─".repeat(scenarioWidth + 2)
	for (let i = 0; i < versions.length; i++) {
		footer += "┴" + "─".repeat(versionWidth)
	}
	footer += "┘"
	console.log(footer)

	console.log("\nNotes:")
	console.log("- f+ = freeze enabled, f- = freeze disabled")
	console.log("- Line 1: absolute execution time")
	console.log("- Line 2: relative performance multiplier")
	console.log("- Line 3: ranking (1st = fastest, 2nd = second fastest, etc.)")
	console.log("- 1.00x indicates the fastest version for that scenario")
}

function printBenchmarkSummaryTable(benchmarks) {
	try {
		const data = extractBenchmarkData(benchmarks)
		if (data.length === 0) {
			console.log("\nNo valid benchmark data found for summary table.")
			return
		}

		const {matrix, scenarios, versions} = organizeBenchmarkMatrix(data)
		const {relativeData, rankings} = calculateRelativePerformanceAndRankings(
			matrix,
			scenarios,
			versions
		)

		printSummaryTable(matrix, scenarios, versions, relativeData, rankings)
	} catch (error) {
		console.error("\nError generating summary table:", error.message)
	}
}

async function main() {
	createBenchmarks()
	const results = await run()

	// Generate and print summary table
	printBenchmarkSummaryTable(results.benchmarks)

	process.exit(0)
}

main()
