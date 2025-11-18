<template>
	<nav class="navbar">
		<router-link to="/home" class="nav-link">Home</router-link>
		<router-link v-if="canAccessEditor" to="/editor" class="nav-link">Editor</router-link>
		<router-link v-if="canAccessAdmin" to="/admin" class="nav-link">Admin</router-link>
	</nav>
</template>

<script setup>
import { computed } from "vue"
import { useStore } from "vuex"

const store = useStore()

const canAccessEditor = computed(() => store.getters.canAccessEditor)
const canAccessAdmin = computed(() => store.getters.canAccessAdmin)
</script>

<style scoped>
.navbar {
	display: flex;
	justify-content: center;
	gap: 2rem;
	padding: 1rem;
	background-color: #f5f5f5;
	border-bottom: 1px solid #ddd;
	margin-bottom: 1rem;
}

.nav-link {
	color: #42b983;
	text-decoration: none;
	font-weight: 500;
	padding: 0.5rem 1rem;
	border-radius: 4px;
	transition: all 0.3s ease;
}

.nav-link:hover {
	background-color: #42b983;
	color: white;
}

.nav-link.router-link-active {
	background-color: #42b983;
	color: white;
}
</style>
