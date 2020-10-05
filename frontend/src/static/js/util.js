import humanizeDuration from 'humanize-duration';

const options = {
	largest : 1, // Only returns 1 unit, so 1 day and not 1 day 2 hours or 1 min and not 1 min 5 seconds
	round: true, // 1 hour vs 1.2 hours
	spacer: "", // 3hours vs 3 hours
	language: "shortEn", // Specify language
	languages: { // Define custom language
		shortEn: {
			y: () => "y",
			mo: () => "mo",
			w: () => "w",
			d: () => "d",
			h: () => "h",
			m: () => "m",
			s: () => "s",
			ms: () => "ms",
		},
	},
}

export const timeSince = (created_at) => {
	let timeInMillis = new Date() - new Date(created_at);
	return humanizeDuration(timeInMillis, options);
}

export const modalBlurHandler = (setShowModal) => {
	let blur = document.querySelector(".out-of-focus");
	return () => {
		blur.style.display = "block";
		blur.addEventListener("click", () => {
			setShowModal(false);
		})

		return () => {
			blur.style.display = "none";
			blur.removeEventListener("click", () => {
				setShowModal(false);
			})
		}
	}
}