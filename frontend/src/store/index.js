import { createStore } from "vuex"
import axios from "axios"

export default createStore({
	state: {
		user: null, 
		isAuthenticated: false,
	},
	getters: {
		currentUser: (state) => state.user,
		isAuthenticated: (state) => state.isAuthenticated,
		username: (state) => state.user?.username || "",
		userRoles: (state) => state.user?.roles || [],
		hasRole: (state) => (role) => {
			return state.user?.roles?.includes(role) || false
		},
		isAdmin: (state) => {
			return state.user?.roles?.includes("Admin") || false
		},
		isEditor: (state) => {
			return state.user?.roles?.includes("Editor") || state.user?.roles?.includes("Admin") || false
		},
		canAccessEditor: (state) => {
			return state.user?.roles?.includes("Editor") || state.user?.roles?.includes("Admin") || false
		},
		canAccessAdmin: (state) => {
			return state.user?.roles?.includes("Admin") || false
		},
	},
	mutations: {
		SET_USER(state, user) {
			state.user = user
			state.isAuthenticated = !!user
		},
		CLEAR_USER(state) {
			state.user = null
			state.isAuthenticated = false
		},
	},
	actions: {
		async login({ commit }, username) {
			try {
				const response = await axios.post(`/api/users/login/${username}`)
				
				if (response.data) {
					commit("SET_USER", response.data)
					return { success: true, user: response.data }
				}
			} catch (error) {
				commit("CLEAR_USER")
				return {
					success: false,
					error: error.response?.data?.message || "Login failed. Please try again.",
				}
			}
		},
		
		logout({ commit }) {
			commit("CLEAR_USER")
		},
		
		checkAuth({ commit, state }) {
			return state.isAuthenticated
		},
	},
	modules: {
		// Define your modules here
	},
})
