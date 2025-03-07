// src/core/services/JwtService.js
const ID_TOKEN_KEY = 'token';

const JwtService = {
    getToken() {
        return localStorage.getItem(ID_TOKEN_KEY);
    },
    saveToken(token) {
        localStorage.setItem(ID_TOKEN_KEY, token);
    },
    destroyToken() {
        localStorage.removeItem(ID_TOKEN_KEY);
    }
};

export default JwtService;
