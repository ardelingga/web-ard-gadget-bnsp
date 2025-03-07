import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

import ApiService from "@/core/services/ApiService";
import { initVeeValidate } from "@/core/plugins/vee-validate";
// import ElementPlus from "element-plus";
import i18n from "@/core/plugins/i18n";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);


app.use(router);
// app.use(ElementPlus);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

ApiService.init(app);
ApiService.setHeader();



initVeeValidate();
app.use(i18n);


app.mount('#app');
