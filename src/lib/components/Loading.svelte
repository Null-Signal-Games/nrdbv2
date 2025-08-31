<div class="loading"></div>

<style>
	/* Temporary styles */
	.loading {
		animation: spin 800ms linear infinite;
		height: 6rem;
		width: 6rem;
		border-radius: 100%;
		border: 1rem solid rgba(255, 255, 255, 0.2);
		border-top: 1rem solid #fff;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
