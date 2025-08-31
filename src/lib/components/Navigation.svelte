<script lang="ts">
	const navigation = [
		{
			title: 'Home',
			url: '/'
		},
		{
			title: 'My Decks',
			url: '/decks'
		},
		{
			title: 'Decklists',
			url: '/decklists'
		},
		{
			title: 'Factions',
			url: '/factions'
		},
		{
			title: 'Formats',
			url: '/formats'
		},
		{
			title: 'Reviews',
			url: '/reviews'
		},
		{
			title: 'Rulings',
			url: '/rulings'
		},
		{
			title: 'Illustrators',
			url: '/illustrators'
		}
	];
</script>

<nav>
	<div>
		<p>Logo</p>
		<input type="search" />
		<button>Register</button>
		<button>Login</button>
		<button>Language select</button>
		<button>Theme toggle</button>
	</div>
	<ul>
		{#each navigation as item (item.url)}
			<li>
				<a href={item.url}>{item.title}</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Temporary styles */
	nav {
		padding-block: 2rem;
		border-bottom: 1px solid red;
	}

	ul {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>
