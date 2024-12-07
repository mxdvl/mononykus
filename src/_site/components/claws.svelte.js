const key = "claw:count";

export const claws = $state({
	count: 1,
	scratch() {
		console.log("scratchin");
		claws.count++;
	},
	read() {
		try {
			console.log("reading");
			const saved = parseInt(localStorage.getItem(key) ?? "NaN", 10);
			if (!isNaN(saved)) {
				claws.count = saved;
			}
		} catch {
			// do nothing
		}
	},
	write() {
		try {
			localStorage.setItem(key, String(claws.count));
		} catch {
			// do nothing
		}
	},
});
