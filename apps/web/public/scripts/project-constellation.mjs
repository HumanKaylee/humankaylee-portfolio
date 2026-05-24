const constellation = document.querySelector("[data-project-constellation]");

if (constellation) {
	const nodes = constellation.querySelectorAll("[data-constellation-node]");

	for (const node of nodes) {
		node.addEventListener("click", () => {
			const artifactId = node.hash?.slice(1);
			const artifact = artifactId ? document.getElementById(artifactId) : null;

			window.setTimeout(() => {
				artifact?.focus({ preventScroll: true });
			}, 0);
		});
	}

	document.body.dataset.constellationReady = "true";
}
