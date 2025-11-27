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
		userStatus: (state) => state.user?.status,
		isUserActive: (state) => state.user?.status === "Enabled",
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

			if (user) {
				try {
					localStorage.setItem("auth_user", JSON.stringify(user))
				} catch (e) {
					console.error("Failed to set user", e)
				}
			}
		},
		CLEAR_USER(state) {
			state.user = null
			state.isAuthenticated = false

			try {
				localStorage.removeItem("auth_user")
			} catch (e) {
				console.error("Failed to clear user", e)
			}
		},
	},
	actions: {
		async login({ commit }, username) {
			try {
				const response = await axios.post(`/api/users/login/${username}`)
				
				if (response.data) {
					if (response.data.status === "Deleted") {
						return {
							success: false,
							error: "User account has been deleted. Please contact support.",
						}
					}
					
					if (response.data.status === "Disabled") {
						return {
							success: false,
							error: "User account has been disabled. Please contact support to reactivate your account.",
						}
					}
					
					if (response.data.status !== "Enabled") {
						return {
							success: false,
							error: "User account is not active. Please contact support.",
						}
					}
					
					commit("SET_USER", response.data)
					return { success: true, user: response.data }
				}
			} catch (error) {
				commit("CLEAR_USER")
				const errorMsg = error.response?.data?.message || ""
				
				let userMsgError = "Login failed. Please try again."
				
				if (errorMsg.includes("deleted")) {
					userMsgError = "This account has been permanently deleted. Please contact support."
				} else if (errorMsg.includes("disabled")) {
					userMsgError = "Your account has been temporarily disabled. Please contact support."
				} else if (errorMsg.includes("not found")) {
					userMsgError = "User not found. Please check your username."
				} else if (errorMsg) {
					userMsgError = errorMsg
				}
				
				return {
					success: false,
					error: userMsgError,
				}
			}
		},
		logout({ commit }) {
			commit("CLEAR_USER")
		},
		
		checkAuth({ state }) {
			return state.isAuthenticated
		},

		initializeAuth({ commit, state }) {
			if (state.isAuthenticated && state.user) return

			try {
				const saved = localStorage.getItem("auth_user")
				if (saved) {
					const parsed = JSON.parse(saved)
					if (parsed) {
						commit("SET_USER", parsed)
					}
				}
			} catch (e) {
				console.error("Failed to init user", e)
			}
		},
	},
	modules: {
		// Define your modules here
	},
})
