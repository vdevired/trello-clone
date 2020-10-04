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