import { describe, expect, it } from "vitest";

import { selectLatestCurrentEntry } from "./current-entry";

describe("selectLatestCurrentEntry", () => {
	it("ignores a newer archived entry in favor of an older current entry", () => {
		const entries = [
			{
				id: "newer-archived",
				data: { date: "2026-09-01", status: "archived" as const },
			},
			{
				id: "older-current",
				data: { date: "2026-08-15", status: "current" as const },
			},
			{
				id: "oldest-current",
				data: { date: "2026-07-01", status: "current" as const },
			},
		];
		const originalOrder = entries.map((entry) => entry.id);

		expect(selectLatestCurrentEntry(entries)?.id).toBe("older-current");
		expect(entries.map((entry) => entry.id)).toEqual(originalOrder);
	});
});
