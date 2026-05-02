import { writable } from "svelte/store";
import { browser } from "$app/env";
import { stats as statStore } from "./Stats";

const getGameStateTemplate = () => {
	return {
		id: null,
		maxGuesses: 6,
		currentGuess: [],
		guesses: [],
		lettersClose: [],
		lettersCorrect: [],
		lettersWrong: [],
		submitted: false,
		victory: false,
		defeat: false,
		error: false,
		hex: null
	};
};

//upgrades the users gameState if new values were added
const upgradeGameState = (gs) => {
	return { ...getGameStateTemplate(), ...gs };
};

const getGameState = () => {
	if (browser && !["undefined", "null", undefined, null].includes(localStorage.getItem("hexleGame"))) {
		return upgradeGameState(JSON.parse(localStorage.getItem("hexleGame")));
	} else {
		return getGameStateTemplate();
	}
};

export const gameState = writable(getGameState());

export const resetGameState = () => {
	gameState.set(getGameStateTemplate());
};

const find = (str, c) => {
	return str.split("").filter((letter) => letter === c).length;
};

let stats;
statStore.subscribe((s) => (stats = s));
const getStreakChar = () => {
	if (stats.currentStreak >= 30) return "⭐";
	if (stats.currentStreak >= 14) return "🔥🔥";
	if (stats.currentStreak >= 7) return "🔥";
	return "";
};

export const shareGameState = (gameState) => {
	if (gameState.guesses.length === 0) return "No game data available";
	if (!gameState.victory && !gameState.defeat) return "Game still in progress";

	const title =
		"Hexle: No." +
		gameState.id +
		" " +
		(gameState.victory ? gameState.guesses.length : "X") +
		"/" +
		gameState.maxGuesses +
		" " +
		getStreakChar() +
		"\nhttps://www.thehexle.io/\n";
	const exportString = [title];
	const hex = gameState.hex;

	gameState.guesses.forEach((guess) => {
		const exportGuess = new Array(6);
		const correctAccounted = [];
		const incorrectAccounted = [];

		guess.forEach((letter, idx) => {
			const lowerLetter = letter.toLowerCase();
			if (hex.includes(lowerLetter) && hex[idx] === lowerLetter) {
				exportGuess[idx] = "🟩";
				correctAccounted.push(lowerLetter);
			}
		});
		// if included and index is off and not already accounted for
		guess.forEach((letter, idx) => {
			const lowerLetter = letter.toLowerCase();
			if (
				hex.includes(lowerLetter) &&
				hex[idx] !== lowerLetter &&
				find(hex, lowerLetter) > find(correctAccounted.join(""), lowerLetter) + find(incorrectAccounted.join(""), lowerLetter)
			) {
				exportGuess[idx] = "🟨";
				incorrectAccounted.push(lowerLetter);
			}
		});

		//everything else
		guess.forEach((_, idx) => {
			if (!["🟩", "🟨"].includes(exportGuess[idx])) exportGuess[idx] = "⬛";
		});

		exportString.push(exportGuess.join(""));
	});

	return exportString.join("\n");
};

gameState.subscribe((gs) => {
	if (browser) localStorage.setItem("hexleGame", JSON.stringify(gs));
});
