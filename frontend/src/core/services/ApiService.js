// src/core/services/ApiService.js
import axios from 'axios';
import JwtService from '@/core/services/JwtService';

const ApiService = {
    init(app) {
        this.vueInstance = app; // Menyimpan vue instance untuk digunakan nantinya
        this.vueInstance.axios = axios.create({
            baseURL: import.meta.env.VITE_APP_API_URL_DEV || 'http://192.168.100.57:3001/'
        });
    },

    setHeader() {
        const token = JwtService.getToken();
        if (this.vueInstance && this.vueInstance.axios) {
            this.vueInstance.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.vueInstance.axios.defaults.headers.common['Accept'] = 'application/json';
        }
    },

    get(resource, params = {}) {
        return this.vueInstance.axios.get(resource, { params });
    },

    post(resource, data) {
        return this.vueInstance.axios.post(resource, data);
    },

    put(resource, data) {
        return this.vueInstance.axios.put(resource, data);
    },

    patch(resource, data) {
        return this.vueInstance.axios.patch(resource, data);
    },


    delete(resource, data = {}) {
        return this.vueInstance.axios.delete(resource, { data });
    }
};

export default ApiService;
