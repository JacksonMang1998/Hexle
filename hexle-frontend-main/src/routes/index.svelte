<script>
	import { onDestroy, onMount } from "svelte";
	import GuessBox from "../components/guess_box.svelte";
	import ColorBox from "../components/color_box.svelte";
	import Keyboard from "../components/keyboard.svelte";
	import { gameState as gameStateStore, resetGameState } from "../stores/Game";
	import { resetStreak, stats, updateStats } from "../stores/Stats";
	import { format } from "date-fns";
	import SocialShare from "../components/social_share.svelte";
	import Loader from "../components/loader.svelte";

	let forceCloseModal = false;
	let gameState;
	let encryptedHex;
	let loading = true;
	const unsubGameStateStore = gameStateStore.subscribe((gs) => (gameState = gs));

	const getHex = async () => {
		const awaitHex = await fetch("https://hexle-backend-production.up.railway.app/get_hex", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ date: format(new Date(), "yyyy-MM-dd") })
		});
		encryptedHex = await awaitHex.json();
	};

	const takeGuess = (e) => {
		gameStateStore.update((gs) => ({ ...gs, submitted: false }));
		if (gameState.hex === e.detail.guessCode) {
			gameStateStore.update((gs) => ({ ...gs, victory: true }));
			updateStats(gameState, true);
		} else if (gameState.guesses.length === gameState.maxGuesses) {
			gameStateStore.update((gs) => ({ ...gs, defeat: true }));
			updateStats(gameState, false);
		}
	};

	const closeModal = () => {
		forceCloseModal = true;
	};

	onMount(() => {
		getHex().then(() => {
			let reloading = false;
			const hexID = encryptedHex.id;
			if (gameState.hex !== encryptedHex.hex || gameState.hex === null) {
				// loose your streak if you miss the hexle for more than a day
				if (gameState.id !== null && hexID - gameState.id > 1) resetStreak();

				// now reset and update to new gamestate
				resetGameState();
				gameStateStore.update((gs) => ({ ...gs, hex: encryptedHex.hex, id: hexID }));

				reloading = true;
				location.reload();
			}
			if (!reloading) loading = false;
		});
	});

	onDestroy(() => {
		unsubGameStateStore();
	});
</script>

<div id="header-container">
	<img src="favicon.png" alt="Logo" id="logo" />
	<p class="title">Hexle!</p>
</div>
<p>
	Welcome to the hexle! In this variation of the wordle, you have {gameState.maxGuesses} guesses to find the hex code of the color below. Good luck!
</p>
<p>
	<a href="/hex_help">What is a hex code?</a> | <a href="/how_play">How do I play?</a> |
	<a href="/my_stats">My stats</a>
</p>
<hr />

{#if loading}
	<Loader />
{:else}
	<div class="columns">
		<div class="stat column is-2 is-offset-2">
			<p class="stat"><b>🎮 Games played:</b> {$stats.plays}</p>
		</div>
		<div class="stat column is-2"><p class="stat"><b>🏆 Games won:</b> {$stats.won}</p></div>
		<div class="stat column is-2"><p class="stat"><b>🔥 Current streak:</b> {$stats.currentStreak}</p></div>
		<div class="stat column is-2"><p class="stat"><b>📈 Highest streak:</b> {$stats.maxStreak}</p></div>
	</div>
	<hr />
	<div id="guess-container">
		<ColorBox hex={gameState.hex} />
		{#each Array(gameState.maxGuesses) as _, idx}
			<div
				id="guess-box-wrapper"
				style="display: {!gameState.victory && !gameState.defeat
					? idx < gameState.guesses.length + 1
						? 'block'
						: 'none'
					: idx < gameState.guesses.length
					? 'block'
					: 'none'};"
			>
				<GuessBox id={idx} hex={gameState.hex} on:guess={takeGuess} />
			</div>
		{/each}
	</div>
	<Keyboard />
{/if}

<hr />
<div id="footer">
	<p>Made with ❤️ by Rahul Rao</p>
	<a href="https://www.buymeacoffee.com/rahulrao" target="_blank"
		><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" id="bmac" /></a
	>
</div>

<div class="modal {gameState.victory && !forceCloseModal ? 'is-active' : ''}">
	<div on:click={closeModal} class="modal-background" />
	<div class="modal-content">
		<p class="subtitle modal-text">You got it!</p>
		<SocialShare />
	</div>
	<button on:click={closeModal} class="modal-close is-large" aria-label="close" />
</div>
<div class="modal {gameState.defeat && !forceCloseModal ? 'is-active' : ''}">
	<div on:click={closeModal} class="modal-background" />
	<div class="modal-content">
		<p class="subtitle modal-text">Better luck tomorrow! The correct color was #{gameState.hex}</p>
		<SocialShare />
	</div>
	<button on:click={closeModal} class="modal-close is-large" aria-label="close" />
</div>

<style>
	#bmac {
		height: 40px;
		width: 160px;
		margin-left: 12px;
	}
	#footer {
		display: inline-flex;
		align-items: center;
	}
	.stat {
		margin-top: 0px;
		margin-bottom: 0px;
		padding-top: 4px;
		padding-bottom: 0px;
	}
	#header-container {
		display: inline-flex;
		align-items: center;
		margin-bottom: 24px;
	}
	#logo {
		margin-right: 8px;
		width: 36px;
		height: 36px;
	}
	.modal-text {
		color: white;
	}
	#guess-box-wrapper {
		margin-bottom: 8px;
	}
	#guess-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
