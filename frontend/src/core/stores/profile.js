import { ref } from 'vue';
import { defineStore } from 'pinia';
import ApiService from '@/core/services/ApiService';

// Konversi profileStore ke JavaScript
export const useProfileStore = defineStore(
    'profile',
    () => {
        const errors = ref({});
        const profile = ref({});

        function setError(error) {
            errors.value = { ...error };
        }

        function setProfile(dataProfile) {
            profile.value = dataProfile;
            errors.value = {};
        }

        function getProfile() {
            ApiService.setHeader();
            return ApiService.get('api/v1/my-account/profile')
                .then(async ({ data }) => {
                    setProfile(data);
                })
                .catch(({ response }) => {
                    setError(response);
                });
        }

        return {
            errors,
            profile,
            getProfile,
        };
    },
    {
        persist: true
    }
);
