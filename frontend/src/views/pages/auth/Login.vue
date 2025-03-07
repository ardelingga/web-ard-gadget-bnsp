<script>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useAuthStore } from '@/core/stores/auth';
import { email as emailRule, required } from '@vee-validate/rules';
import Swal from 'sweetalert2';
import { configure, defineRule, useField, useForm } from 'vee-validate';
import { useRouter } from 'vue-router';

export default {
    name: 'Login',
    components: {
        FloatingConfigurator
    },
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();

        // get isAuthenticated
        const isAuthenticated = authStore.isAuthenticated;
        if(isAuthenticated) {
            router.push({ name: 'dashboard' });
        }


        // Define validation rules
        defineRule('required', required);
        defineRule('email', emailRule);

        // Konfigurasikan pesan error global
        configure({
            generateMessage: (ctx) => {
                const fieldNames = {
                    email: 'Email Address',
                    password: 'Password'
                };

                const messages = {
                    required: `${fieldNames[ctx.field] || ctx.field} is required.`,
                    email: `${fieldNames[ctx.field] || ctx.field} must be a valid email address.`
                };

                return messages[ctx.rule.name] || `${fieldNames[ctx.field] || ctx.field} is invalid.`;
            },
            validateOnBlur: true, // Validasi saat input kehilangan fokus
            validateOnChange: true // Validasi langsung saat input berubah
        });

        // Definisikan form field dengan validasi
        const { handleSubmit } = useForm();
        const { value: email, errorMessage: emailError } = useField('email', 'required|email');
        const { value: password, errorMessage: passwordError } = useField('password', 'required');

        // Definisikan fungsi submit
        const onSubmitLogin = handleSubmit(async (values) => {
            // Validate form
            if (!email.value || !password.value) {
                return;
            }

            // Submit form
            await authStore.login({
                email: email.value,
                password: password.value
            });

            if (authStore.errors.loginError) {
                // Tampilkan pesan error menggunakan Swal
                Swal.fire({
                    text: authStore.errors.loginError,
                    icon: 'error',
                    confirmButtonText: 'Try again!'
                });
            } else {
                // Jika login berhasil
                Swal.fire({
                    text: 'Login successful!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then(() => {
                    router.push({ name: 'dashboard' });
                });
            }
        });

        return {
            email,
            emailError,
            password,
            passwordError,
            onSubmitLogin
        };
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="flex flex-col items-center justify-center text-center mb-8">
                        <img alt="Logo" src="@/assets/icons/logo_ard_gadget_bnsp.png" class="layout-topbar-logo-img h-14 rounded-lg mb-14" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Login</div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>

                    <form @submit.prevent="onSubmitLogin">
                        <!-- Email Field -->
                        <div class="flex flex-col mb-3">
                            <label for="email" class="block text-xl font-medium mb-2">Email</label>
                            <InputText id="email" type="email" placeholder="Email address" class="w-full md:w-[30rem]" v-model="email" />
                            <span class="text-red-500 text-sm">{{ emailError }}</span>
                        </div>

                        <!-- Password Field -->
                        <div class="flex flex-col mb-3">
                            <label for="password" class="block text-xl font-medium mb-2">Password</label>
                            <Password id="password" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false" />
                            <span class="text-red-500 text-sm">{{ passwordError }}</span>
                        </div>

                        <!-- Submit Button -->
                        <Button type="submit" label="Login" class="w-full"></Button>

                        <!-- Link to Register -->
                        <div class="flex items-center justify-center mt-4">
                            <span>Don't have an account?</span>
                            <router-link to="/auth/register" class="text-primary ml-2">Sign Up</router-link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.text-red-500 {
    color: red;
    font-size: 0.875rem;
}

.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
