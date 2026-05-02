import { writable } from "svelte/store";
import { browser } from "$app/env";

let writeLock = false;

const getStatsTemplate = () => {
	return {
		plays: 0,
		won: 0,
		currentStreak: 0,
		maxStreak: 0,
		distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
	};
};

// upgrades the users local stats store if new keys are added
const upgradeStats = (s) => {
	return { ...getStatsTemplate(), ...s };
};

const getStats = () => {
	if (browser && !["undefined", "null", undefined, null].includes(localStorage.getItem("hexleStats"))) {
		return upgradeStats(JSON.parse(localStorage.getItem("hexleStats")));
	} else {
		return getStatsTemplate();
	}
};

export const stats = writable(getStats());

stats.subscribe((s) => {
	if (browser) localStorage.setItem("hexleStats", JSON.stringify(s));
});

export const resetStreak = () => {
	stats.update((current) => {
		return {
			...current,
			currentStreak: 0
		};
	});
};

export const updateStats = (gameState, victory) => {
	if (writeLock) return;

	const guess = gameState.guesses.length;

	if (victory) {
		stats.update((current) => {
			return {
				...current,
				plays: current.plays + 1,
				won: current.won + 1,
				currentStreak: current.currentStreak + 1,
				maxStreak: Math.max(current.currentStreak + 1, current.maxStreak),
				distribution: { ...current.distribution, [guess]: current.distribution[guess] + 1 }
			};
		});
	} else {
		stats.update((current) => {
			return {
				...current,
				plays: current.plays + 1,
				currentStreak: 0
			};
		});
	}

	writeLock = true;
};
