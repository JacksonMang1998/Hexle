<script>
	import { onDestroy } from "svelte";

	import { gameState as gameStateStore } from "../stores/Game";
	const acceptedChars = ["a", "b", "c", "d", "e", "f", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
	const bgColors = [...new Array(16)].map(() => "#FFFFFF");

	let gameState;

	const pushGuess = () => {
		const error =
			!gameState.currentGuess.reduce((previous, current) => previous && acceptedChars.includes(current.toLowerCase()), true) ||
			gameState.currentGuess.length !== 6;
		if (error) {
			gameStateStore.update((gs) => ({ ...gs, error: true }));
		} else {
			gameStateStore.update((gs) => ({ ...gs, guesses: [...gs.guesses, gs.currentGuess], currentGuess: [], submitted: true, error: false }));
		}
	};

	const deleteCurrentGuess = () => {
		if (gameState.currentGuess.length > 0) gameStateStore.update((gs) => ({ ...gs, currentGuess: gs.currentGuess.slice(0, -1) }));
	};

	const addCurrentGuess = (letter) => {
		if (gameState.currentGuess.length < 6) gameStateStore.update((gs) => ({ ...gs, currentGuess: [...gs.currentGuess, letter] }));
	};

	const updateGuessOnKey = (e) => {
		if (gameState.victory || gameState.defeat) return;
		if (e.key === "Enter") {
			pushGuess();
		} else if (e.key === "Backspace" || e.key === "Delete") {
			deleteCurrentGuess();
		} else {
			if (e.key.match(/^[0-9a-zA-Z]+$/) && e.key.length === 1) {
				addCurrentGuess(e.key.toLowerCase());
			}
		}
	};

	const updateGuessOnTouch = (key) => {
		if (gameState.victory || gameState.defeat) return;
		if (key === "submit") {
			pushGuess();
		} else if (key === "delete") {
			deleteCurrentGuess();
		} else {
			addCurrentGuess(key);
		}
	};

	const unsubGameStateStore = gameStateStore.subscribe((gs) => {
		gameState = gs;

		gs.lettersWrong.forEach((letter) => {
			bgColors[acceptedChars.indexOf(letter)] = "#E3E3E3";
		});
		gs.lettersClose.forEach((letter) => {
			bgColors[acceptedChars.indexOf(letter)] = "#FFEA00";
		});
		gs.lettersCorrect.forEach((letter) => {
			bgColors[acceptedChars.indexOf(letter)] = "#90EE90";
		});
	});

	onDestroy(unsubGameStateStore);
</script>

<svelte:window on:keydown={updateGuessOnKey} />

<div class="keyboard">
	<div class="left" style="text-align: right; margin-right: 39px">
		{#each Array(3) as _, idx}
			<div class="row">
				{#each Array(2) as _, idy}
					<button
						on:click={() => updateGuessOnTouch(acceptedChars[idx * 2 + idy])}
						class="button is-custom"
						style="background-color: {bgColors[idx * 2 + idy]}">{acceptedChars[idx * 2 + idy].toUpperCase()}</button
					>
				{/each}
			</div>
		{/each}
		<div class="row">
			<button
				on:click={() => updateGuessOnTouch("submit")}
				class="button is-dbl-custom"
				style="margin-left: 0px; margin-right: 4px; background-color: #90EE90;">Guess</button
			>
		</div>
	</div>
	<div class="right" style="text-align: left;">
		{#each Array(3) as _, idx}
			<div class="row">
				{#each Array(3) as _, idy}
					<button
						on:click={() => updateGuessOnTouch(acceptedChars[idx * 3 + idy + 6])}
						class="button is-custom"
						style="background-color: {bgColors[idx * 3 + idy + 6]}">{acceptedChars[idx * 3 + idy + 6].toUpperCase()}</button
					>
				{/each}
			</div>
		{/each}
		<div class="row">
			<button
				on:click={() => updateGuessOnTouch(acceptedChars[15])}
				class="button is-custom"
				style="background-color: {bgColors[15]}; margin-right: 0px;">{acceptedChars[15].toUpperCase()}</button
			>
			<button on:click={() => updateGuessOnTouch("delete")} class="button is-dbl-custom">Delete</button>
		</div>
	</div>
</div>

<style>
	.keyboard {
		margin-top: 50px;
		margin-left: 6px;
		display: flex;
		justify-content: center;
	}
	.is-custom {
		width: 35px;
		height: 40px;
		padding: 0px;
		margin-right: 4px;
		text-align: center;
	}
	.is-dbl-custom {
		width: 74px;
		height: 40px;
		padding: 0px;
		text-align: center;
	}
	.row {
		margin-bottom: 4px;
	}
</style>
