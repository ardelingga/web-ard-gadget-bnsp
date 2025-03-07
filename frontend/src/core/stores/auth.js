import ApiService from '@/core/services/ApiService';
import JwtService from '@/core/services/JwtService';
import router from '@/router';
import { defineStore } from 'pinia';
import Swal from 'sweetalert2';
import { ref } from 'vue';

// Pinia Store untuk Authentication
export const useAuthStore = defineStore('auth', () => {
    // State
    const errors = ref({});
    const user = ref({});
    const isAuthenticated = ref(!!JwtService.getToken());

    // Set data user dan token ke dalam state
    function setAuth(authUser) {
        isAuthenticated.value = true;
        user.value = authUser;
        errors.value = {};

        const { access_token } = user.value;
        JwtService.saveToken(access_token);

        // Set header Authorization
        ApiService.setHeader();
    }

    function register(credentials) {
        console.log('DO REGISTER');
        return ApiService.post('/api/auth/signUp', credentials)
            .then((response) => {
                console.log('RESPONSE SUCCESS REGISTER');
                console.log(response.data);

                console.log('data.data');
                console.log(response.data.data);

                console.log('data.status');
                console.log(response.data.status);

                setAuth(response.data.data);
            })
            .catch(({ response }) => {
                console.log('RESPONSE FAILED REGISTER');
                console.log(response);
                console.log(response?.data?.message);
                setError({
                    registerError: response?.data?.message || 'An unknown error occurred'
                });
            });
    }

    function login(credentials) {
        return ApiService.post('/api/auth/signIn', credentials)
            .then((response) => {
                console.log('RESPONSE SUCCESS LOGIN');
                console.log(response.data);

                console.log('data.data');
                console.log(response.data.data);

                console.log('data.status');
                console.log(response.data.status);

                setAuth(response.data.data);
            })
            .catch(({ response }) => {
                console.log('RESPONSE FAILED LOGIN');
                console.log(response);
                console.log(response?.data?.message);

                console.log('data.status');
                console.log(response.data.status);

                setError({
                    loginError: response?.data?.message || 'An unknown error occurred'
                });
            });
    }

    function logout() {
        Swal.fire({
            text: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'No, cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                purgeAuth();
                router.push({ name: 'login' });
            }
        });
    }

    // Set error ke dalam state
    function setError(error) {
        errors.value = { ...error };
    }

    // Bersihkan data auth (ketika logout atau token expired)
    function purgeAuth() {
        isAuthenticated.value = false;
        user.value = {};
        errors.value = {};
        JwtService.destroyToken(); // Hapus token dari localStorage
        localStorage.clear(); // Bersihkan localStorage
    }

    // Logout paksa (force logout)
    function forceLogout() {
        ApiService.setHeader(); // Set header Authorization (token)
        return ApiService.post('api/v1/logout', {})
            .then(({ data }) => {
                if (data.code !== 200) {
                    throw new Error(data.msg);
                }
                if (data.code === 401) {
                    throw new Error(data.msg);
                }
                Swal.fire({
                    text: data.msg,
                    icon: 'success',
                    buttonsStyling: false,
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    customClass: {
                        confirmButton: 'btn fw-semobold btn-light-primary'
                    }
                }).then(() => {
                    router.push({ name: 'sign-in' }); // Redirect ke halaman login
                    purgeAuth(); // Hapus data auth (ketika logout)
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // State untuk reset password
    const responseReset = ref({});
    const setResponeReset = (data) => {
        responseReset.value = data;
    };

    const errorReset = ref({});
    const setErrorReset = (data) => {
        errorReset.value = data;
    };

    // Request reset password (step 1)
    function forgotPassword(email) {
        return ApiService.post('api/v1/forgot-pass', email)
            .then(({ data }) => {
                setResponeReset(data); // Jika sukses, simpan data reset
            })
            .catch(({ response }) => {
                setErrorReset(response); // Cek dan simpan error ke state jika gagal
            });
    }

    // Reset password (step 2)
    function resetPassword(data) {
        return ApiService.post('api/v1/reset-pass', data)
            .then(({ data }) => {
                setResponeReset(data); // Jika berhasil
            })
            .catch(({ response }) => {
                setErrorReset(response); // Jika gagal
            });
    }

    // Cek apakah user masih autentik
    function verifyAuth() {
        if (JwtService.getToken()) {
            // Lakukan sesuatu jika token valid
        } else {
            purgeAuth(); // Jika token tidak valid, hapus info user
        }
    }

    // Export from Pinia Store
    return {
        errors,
        user,
        isAuthenticated,
        login,
        logout,
        forceLogout,
        register,
        forgotPassword,
        verifyAuth,
        responseReset,
        resetPassword,
        errorReset
    };
});
