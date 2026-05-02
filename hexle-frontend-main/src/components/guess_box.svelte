<script>
	import { createEventDispatcher, onDestroy } from "svelte";
	import { gameState as gameStateStore } from "../stores/Game";

	export let id;
	export let hex;

	const dispatch = createEventDispatcher();
	const bgColors = [...new Array(6)].map(() => "#FFFFFF");

	let gameState;
	let displayValue;

	const find = (str, c) => {
		return str.split("").filter((letter) => letter === c).length;
	};

	const updateColors = (guess, updateStore) => {
		const correct = [];
		const almost = [];
		const wrong = [];

		// if included and fully correct
		guess.forEach((letter, idx) => {
			const lowerLetter = letter.toLowerCase();
			if (hex.includes(lowerLetter) && hex[idx] === lowerLetter) {
				bgColors[idx] = "#90EE90";
				correct.push(lowerLetter);
			}
		});
		// if included and index is off and not already accounted for
		guess.forEach((letter, idx) => {
			const lowerLetter = letter.toLowerCase();
			if (
				hex.includes(lowerLetter) &&
				bgColors[idx] !== "#90EE90" &&
				find(hex, lowerLetter) > find(correct.join(""), lowerLetter) + find(almost.join(""), lowerLetter)
			) {
				bgColors[idx] = "#FFEA00";
				almost.push(lowerLetter);
			}
		});

		//everything else
		guess.forEach((letter, idx) => {
			const lowerLetter = letter.toLowerCase();
			if (!["#90EE90", "#FFEA00"].includes(bgColors[idx])) {
				bgColors[idx] = "#E3E3E3";
				wrong.push(lowerLetter);
			}
		});

		if (updateStore) {
			gameStateStore.update((gs) => ({
				...gs,
				lettersCorrect: [...gs.lettersCorrect, ...correct],
				lettersClose: [...gs.lettersClose, ...almost],
				lettersWrong: [...gs.lettersWrong, ...wrong]
			}));
		}
	};

	const unsubGameStateStore = gameStateStore.subscribe((gs) => {
		gameState = gs;

		if (gs.guesses.length === id) {
			displayValue = gs.currentGuess;
		} else {
			displayValue = gs.guesses[id];
			if (displayValue) updateColors(displayValue, false);
		}

		if (gs.submitted && gs.guesses.length === id + 1 && !gameState.error) {
			updateColors(gameState.guesses[id], true);
			dispatch("guess", { guessCode: gameState.guesses[id].join("") });
		}
	});

	onDestroy(unsubGameStateStore);
</script>

<div id="form-container">
	<span class="subtitle">#</span>
	{#each Array(6) as _, idx}
		<input
			value={displayValue ? displayValue[idx] || "" : ""}
			class="{gameState.error && gameState.guesses.length === id ? 'is-danger' : ''} input is-medium"
			style="background-color: {bgColors[idx]}; text-transform: uppercase"
			maxlength="1"
			type="text"
			required
			readonly
		/>
	{/each}
	<div id="actual-color-box" style="background-color: #{gameState.guesses[id] ? hex : 'ffffff'};" />
	<div id="guess-color-box" style="background-color: #{gameState.guesses[id] ? gameState.guesses[id].join('') : 'ffffff'};" />
</div>

{#if gameState.error && gameState.guesses.length === id}
	<p id="error">Your guess contains invalid characters</p>
{/if}

<style>
	#actual-color-box {
		border: 1px solid black;
		border-right: none;
		margin-left: 4px;
		width: 15px;
		height: 30px;
	}
	#guess-color-box {
		border: 1px solid black;
		border-left: none;
		width: 15px;
		height: 30px;
	}
	#error {
		color: red;
	}
	#form-container {
		display: inline-flex;
		align-items: center;
	}
	.subtitle {
		margin-bottom: 0px;
		margin-right: 8px;
		width: 30px;
		text-align: right;
	}
	.input {
		width: 40px;
		padding: 0px;
		margin-right: 4px;
		text-align: center;
	}
</style>
