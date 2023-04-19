<body>
	<slot />
</body>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(one-claw) {
		display: block;
		background-color: ghostwhite;
	}

	:global(one-claw[foraging='complete']) {
		background-color: honeydew;
	}

	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

		margin: 0;
		padding: 0;
		background-color: floralwhite;
		color: hsl(6, 60%, 18%);
	}
</style>
