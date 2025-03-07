<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import swal from 'sweetalert2';
import { useCashflowStore } from '@/core/stores/cashflow';

// Gunakan Cashflow store
const cashflowStore = useCashflowStore();
const router = useRouter();

// State untuk form tambah cashflow
const type = ref(''); // Mengelola jenis cashflow ("income" atau "expense")
const value = ref(0); // Mengelola jumlah cashflow
const description = ref(''); // Mengelola deskripsi cashflow
const date = ref(''); // Mengelola tanggal cashflow
const isSubmitting = ref(false); // Status saat submit form

// Fungsi Tambah Cashflow
async function addCashflow() {
    try {
        isSubmitting.value = true;

        // Payload yang akan dikirimkan
        const payload = {
            type: type.value,
            value: Number(value.value), // Konversi ke angka
            description: description.value,
            date: date.value
        };

        // Panggil fungsi addCashflow dari store
        await cashflowStore.addCashflow(payload);

        // Reset form setelah berhasil
        type.value = '';
        value.value = 0;
        description.value = '';
        date.value = '';

        window.location.href = '/arus-kas';
    } catch (error) {
        console.error(error);
        await swal.fire('Error', error.message || 'Data cashflow gagal ditambahkan.', 'error');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="w-full">
        <!-- Card Formulir Tambah Cashflow -->
        <div class="card flex flex-col gap-4 p-6">
            <div class="font-semibold text-xl">Tambah Cashflow</div>

            <!-- Jenis Cashflow (Income/Expense) -->
            <div>
                <label for="cashflow-type" class="block font-medium mb-2">Jenis Cashflow</label>
                <Dropdown
                    id="cashflow-type"
                    v-model="type"
                    :options="[
                        { label: 'Income (Pemasukan)', value: 'income' },
                        { label: 'Expense (Pengeluaran)', value: 'expense' }
                    ]"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih jenis cashflow"
                    class="w-full"
                    :disabled="isSubmitting"
                />
            </div>

            <!-- Jumlah Nominal Cashflow -->
            <div>
                <label for="cashflow-value" class="block font-medium mb-2">Jumlah Nominal</label>
                <InputGroup>
                    <InputGroupAddon>Rp. </InputGroupAddon>
                    <InputNumber
                        v-model="value"
                        class="w-full h-12"
                        type="number"
                        placeholder="Masukkan jumlah nominal"
                        :disabled="isSubmitting"
                        id="cashflow-value"
                    />
<!--                    <InputGroupAddon>.00</InputGroupAddon>-->
                </InputGroup>
            </div>

            <!-- Deskripsi Cashflow -->
            <div>
                <label for="cashflow-description" class="block font-medium mb-2">Deskripsi</label>
                <textarea id="cashflow-description" v-model="description" class="w-full h-24 p-3 border border-gray-300 rounded-md" placeholder="Masukkan deskripsi cashflow" :disabled="isSubmitting" />
            </div>

            <!-- Tanggal Cashflow -->
            <div>
                <label for="cashflow-date" class="block font-medium mb-2">Tanggal Transaksi</label>
                <DatePicker id="cashflow-date" type="date" v-model="date" :showIcon="true" :showButtonBar="true" placeholder="Pilih tanggal transaksi" class="w-full h-12 border border-gray-300 rounded-md" :disabled="isSubmitting" />
            </div>

            <!-- Tombol Tambah Cashflow -->
            <Button :disabled="isSubmitting" icon="pi pi-plus" label="Tambah Cashflow" class="mt-4" @click="addCashflow" />
        </div>
    </div>
</template>

<style scoped>
.card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
