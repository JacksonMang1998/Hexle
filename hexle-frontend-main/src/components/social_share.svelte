<script>
	import { browser } from "$app/env";
	import { onDestroy } from "svelte";
	import { shareGameState, gameState as gameStateStore } from "../stores/Game";
	import ClipboardJS from "clipboard";

	let gameState;
	let canShare;
	let clipboard;
	let copyMessageText = "✉️ Share game";
	const unsubGameStateStore = gameStateStore.subscribe((gs) => (gameState = gs));

	const setCopyMessage = (message) => {
		copyMessageText = message;
		setTimeout(() => (copyMessageText = "✉️ Share game"), 2000);
	};

	const nativeShare = () => {
		navigator
			.share({
				title: "Today's hexle!",
				text: shareGameState(gameState)
			})
			.then(() => {
				setCopyMessage("Shared!");
			})
			.catch(() => {
				setCopyMessage("Game was not shared");
			});
	};

	if (browser) {
		canShare = navigator.share;
		clipboard = new ClipboardJS("#copier");

		clipboard.on("success", (e) => {
			setCopyMessage("Copied!");
			e.clearSelection();
		});

		clipboard.on("error", () => {
			setCopyMessage("An error occured 😔");
		});
	}

	onDestroy(() => {
		if (browser) clipboard.destroy();
		unsubGameStateStore();
	});
</script>

{#if canShare}
	<button class="button is-primary" on:click={nativeShare}>{copyMessageText}</button>
{:else}
	<button class="button is-primary" id="copier" data-clipboard-text={shareGameState(gameState)}>{copyMessageText}</button>
{/if}

<style>
	button {
		width: 170px;
	}
</style>
