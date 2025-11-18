import { createRouter, createWebHistory } from "vue-router"
import Login from "../views/Login.vue"
import store from "../store"

const routes = [
	{
		path: "/",
		name: "Login",
		component: Login,
		meta: { requiresAuth: false },
	},
	{
		path: "/home",
		name: "Home",
		// Lazy loading for better performance
		component: () => import("../views/Home.vue"),
		meta: { requiresAuth: true, allowedRoles: ["User", "Editor", "Admin"] },
	},
	{
		path: "/editor",
		name: "Editor",
		component: () => import("../views/EditorView.vue"),
		meta: { requiresAuth: true, allowedRoles: ["Editor", "Admin"] },
	},
	{
		path: "/admin",
		name: "Admin",
		component: () => import("../views/AdminView.vue"),
		meta: { requiresAuth: true, allowedRoles: ["Admin"] },
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to, from, next) => {
	const requiresAuth = to.meta.requiresAuth
	const allowedRoles = to.meta.allowedRoles
	const isAuthenticated = store.getters.isAuthenticated
	const userRoles = store.getters.userRoles

	if (!requiresAuth) {
		next()
		return
	}

	if (!isAuthenticated) {
		next({ name: "Login" })
		return
	}

	if (allowedRoles && allowedRoles.length > 0) {
		const hasAccess = userRoles.some((role) => allowedRoles.includes(role))

		if (!hasAccess) {
			next({ name: "Home" })
			return
		}
	}

	next()
})

export default router
