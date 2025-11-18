import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import axios from "axios"

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			const errorMessage = error.response?.data?.message || ""
			
			store.commit("CLEAR_USER")
			
			if (router.currentRoute.value.name !== "Login") {
				router.push({ 
					name: "Login", 
					query: { error: errorMessage } 
				})
			}
		}
		return Promise.reject(error)
	}
)

const app = createApp(App)

app.use(router)
app.use(store)
app.mount("#app")
