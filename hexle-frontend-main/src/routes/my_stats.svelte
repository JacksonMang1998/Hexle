<script>
	import { stats as statsStore } from "../stores/Stats";
	import Chart from "chart.js/auto/auto.js";
	import { onDestroy, onMount } from "svelte";
	import { browser } from "$app/env";
	import { add, set } from "date-fns";
	import SocialShare from "../components/social_share.svelte";

	let stats;
	const unsubStatStore = statsStore.subscribe((s) => (stats = s));

	onMount(() => {
		const ctx = document.getElementById("distribution").getContext("2d");
		const graph = new Chart(ctx, {
			type: "bar",
			data: {
				labels: [...new Array(6)].map((_, idx) => idx + 1 + ""),
				datasets: [
					{
						label: "attempts",
						data: Object.values(stats.distribution),
						backgroundColor: "rgba(255, 159, 64, 0.2)"
					}
				]
			},
			options: {
				scales: {
					y: {
						suggestedMax: 3,
						beginAtZero: true,
						ticks: {
							stepSize: 1
						}
					}
				},
				plugins: {
					title: {
						display: true,
						position: "bottom",
						text: "Distribution of successful attempts"
					}
				}
			}
		});
	});

	const deleteData = () => {
		if (browser && confirm("Are you sure you want to delete everything? This cannot be undone!")) {
			localStorage.clear();
			location.reload();
		}
	};

	let timer = "Loading...";

	if (browser) {
		//try here incase someone has it blocked
		try {
			countdown(
				set(add(new Date(), { days: 1 }), { hours: 0, minutes: 0, seconds: 0 }),
				(ts) => {
					timer = ts.toString();
				},
				countdown.HOURS | countdown.MINUTES | countdown.SECONDS
			);
		} catch (error) {
			timer = "Error loading timer";
		}
	}

	onDestroy(() => {
		unsubStatStore();
	});
</script>

<div id="work">
	<p class="body-text subtitle"><a href="/">Go back</a></p>
	<p class="title">My stats:</p>
	<hr />
	<div class="columns is-mobile">
		<div class="column">
			<p><b>🎮 Games played:</b> {stats.plays}</p>
			<p><b>🏆 Games won:</b> {stats.won}</p>
			<p><b>🔥 Current streak:</b> {stats.currentStreak}</p>
			<p><b>📈 Highest streak:</b> {stats.maxStreak}</p>
		</div>
		<div class="column" id="buttons">
			<SocialShare />
			<button class="button is-danger" on:click={deleteData}>🗑️ Delete all stats</button>
		</div>
	</div>
	<hr />
	<canvas id="distribution" />
	<hr />
	<p class="title">Next hex in:</p>
	<p>
		{timer}
	</p>
</div>

<style>
	#buttons {
		text-align: right;
	}
	button {
		width: 170px;
	}
	.body-text {
		margin-bottom: 36px;
	}
	#work {
		max-width: 544px;
		text-align: left;
		margin: auto auto;
	}
</style>
