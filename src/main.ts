import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import App from './App.vue';
import routes from './router';
import './styles.css';
import './styles/prime-overrides.css';
import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const router = createRouter({
  history: createWebHistory(),
  routes
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);
app.component('Button', Button);
app.mount('#app');
