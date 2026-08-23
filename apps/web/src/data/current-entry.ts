type DatedStatusEntry = {
	data: {
		date: string;
		status: string;
	};
};

export function selectLatestCurrentEntry<T extends DatedStatusEntry>(
	entries: readonly T[],
): T | undefined {
	return entries
		.filter((entry) => entry.data.status === "current")
		.sort((left, right) => right.data.date.localeCompare(left.data.date))[0];
}
