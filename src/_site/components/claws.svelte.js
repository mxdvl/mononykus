const key = "claw:count";

let count = $state(1);

export const claws = {
	count,
	scratch() {
		count++;
	},
	read() {
		try {
			const saved = parseInt(localStorage.getItem(key) ?? "NaN", 10);
			if (!isNaN(saved)) {
				count = saved;
			}
		} catch {
			// do nothing
		}
	},
	write() {
		try {
			localStorage.setItem(key, String(count));
		} catch {
			// do nothing
		}
	},
};
