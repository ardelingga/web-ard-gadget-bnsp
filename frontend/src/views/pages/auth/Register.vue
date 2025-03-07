<script>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { defineRule, configure, useForm, useField } from 'vee-validate';
import { required, email as emailRule, min } from '@vee-validate/rules';
import { useAuthStore } from '@/core/stores/auth';
import { useProfileStore } from '@/core/stores/profile';
import Swal from 'sweetalert2';
import router from '@/router';

export default {
    name: 'Register',
    components: {
        FloatingConfigurator
    },
    setup() {
        const authStore = useAuthStore();

        // get isAuthenticated
        const isAuthenticated = authStore.isAuthenticated;
        if(isAuthenticated) {
            router.push({ name: 'dashboard' });
        }

        // Define validation rules
        defineRule('required', required);
        defineRule('email', emailRule);
        defineRule('min', min);

        // Konfigurasikan pesan error global
        configure({
            generateMessage: (ctx) => {
                const fieldNames = {
                    name_business: 'Name Business',
                    email: 'Email Address',
                    phone_number: 'Phone Number',
                    address: 'Address',
                    password: 'Password'
                };

                const messages = {
                    required: `${fieldNames[ctx.field] || ctx.field} is required.`,
                    email: `${fieldNames[ctx.field] || ctx.field} must be a valid email address.`,
                    min: `${fieldNames[ctx.field] || ctx.field} must have at least ${ctx.rule.params[0]} characters.`
                };

                return messages[ctx.rule.name] || `${fieldNames[ctx.field] || ctx.field} is invalid.`;
            },
            validateOnBlur: true, // Validasi saat input kehilangan fokus
            validateOnChange: true // Validasi langsung saat input berubah
        });

        // Definisikan form field dengan validasi
        const { handleSubmit } = useForm();
        const { value: name_business, errorMessage: name_businessError } = useField('name_business', 'required|min:4');
        const { value: email, errorMessage: emailError } = useField('email', 'required|email');
        const { value: phone_number, errorMessage: phoneError } = useField('phone_number', 'required|min:8');
        const { value: address, errorMessage: addressError } = useField('address', 'required|min:4');
        const { value: password, errorMessage: passwordError } = useField('password', 'required|min:6');

        // Definisikan fungsi submit
        const onSubmitRegister = handleSubmit(async (values) => {
            console.log('Form Submitted with values:', values);

            // Validate form
            if (!name_business.value || !email.value || !phone_number.value || !address.value || !password.value) {
                return;
            }

            // Submit form
            await authStore.register({
                name_business: name_business.value,
                email: email.value,
                phone_number: phone_number.value,
                address: address.value,
                password: password.value
            });

            if (authStore.errors.registerError) {
                // Tampilkan pesan error menggunakan Swal
                Swal.fire({
                    text: authStore.errors.registerError, // Pesan error yang spesifik
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: 'Try again!',
                    heightAuto: false,
                    customClass: {
                        // Tambahkan kelas CSS PrimeVue untuk tampilan tombol
                        confirmButton: 'p-button p-component p-button-danger', // Gaya tombol danger di PrimeVue
                        cancelButton: 'p-button p-component p-button-secondary' // Gaya tombol secondary
                    }
                }).then(() => {
                    // Reset error setelah ditampilkan
                    authStore.errors.registerError = null;
                });
            } else {
                // Jika tidak ada error, anggap register sukses
                Swal.fire({
                    text: 'You have successfully registered! Remember to memorize your credentials for future use.',
                    icon: 'success',
                    buttonsStyling: false,
                    confirmButtonText: 'Ok, got it!',
                    heightAuto: false,
                    customClass: {
                        confirmButton: 'p-button p-component p-button-success p-button-rounded'
                    }
                }).then(() => {
                    // Redirect atau tindakan lain setelah sukses
                    router.push({ name: 'dashboard' });
                });
            }

            // .then((response) => {
            //     console.log("REPONSE API :");
            //     console.log(response);
            //     if (response.status === 201) {
            //         //berhasil
            //         // profileStore.getProfile();
            //         window.location.href = '/';
            //     }
            // })
            // .catch((error) => {
            //     console.log(error);
            // });
        });

        return {
            name_business,
            name_businessError,
            email,
            emailError,
            phone_number,
            phoneError,
            address,
            addressError,
            password,
            passwordError,
            onSubmitRegister
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
                        <img alt="Logo" src="@/assets/icons/logo_ard_kasir.png" class="layout-topbar-logo-img h-14 rounded-lg mb-14" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Register</div>
                        <span class="text-muted-color font-medium">Sign up to continue</span>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="onSubmitRegister">
                        <div>
                            <!-- Name Business -->
                            <div class="flex flex-col mb-3">
                                <label for="name_business" class="block text-xl font-medium mb-2">Name Business</label>
                                <InputText id="name_business" type="text" placeholder="Name Business" class="w-full md:w-[30rem]" v-model="name_business" />
                                <span class="text-red-500 text-sm">{{ name_businessError }}</span>
                            </div>

                            <!-- Email -->
                            <div class="flex flex-col mb-3">
                                <label for="email" class="block text-xl font-medium mb-2">Email</label>
                                <InputText id="email" type="email" placeholder="Email address" class="w-full md:w-[30rem]" v-model="email" />
                                <span class="text-red-500 text-sm">{{ emailError }}</span>
                            </div>

                            <!-- Phone Number -->
                            <div class="flex flex-col mb-3">
                                <label for="phone_number" class="block text-xl font-medium mb-2">Phone Number</label>
                                <InputText id="phone_number" type="number" placeholder="Phone Number" class="w-full md:w-[30rem]" v-model="phone_number" />
                                <span class="text-red-500 text-sm">{{ phoneError }}</span>
                            </div>

                            <!-- Address -->
                            <div class="flex flex-col mb-3">
                                <label for="address" class="block text-xl font-medium mb-2">Address</label>
                                <Textarea id="address" rows="4" placeholder="Address" class="w-full md:w-[30rem]" v-model="address" />
                                <span class="text-red-500 text-sm">{{ addressError }}</span>
                            </div>

                            <!-- Password -->
                            <div class="flex flex-col mb-3">
                                <label for="password" class="block text-xl font-medium mb-2">Password</label>
                                <Password id="password" v-model="password" placeholder="Password" :toggleMask="true" class="w-full md:w-[30rem]" fluid :feedback="false" />
                                <span class="text-red-500 text-sm">{{ passwordError }}</span>
                            </div>

                            <!-- Submit Button -->
                            <Button type="submit" label="Sign Up" class="w-full"></Button>

                            <div class="flex items-center justify-center mt-4">
                                <span>Don't have an account?</span>
                                <router-link to="/auth/register" class="text-primary ml-2">Sign Up</router-link>
                            </div>
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
    font-size: 0.875rem; /* Small text */
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
