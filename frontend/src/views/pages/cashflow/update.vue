<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import swal from "sweetalert2";
import { useCashflowStore } from "@/core/stores/cashflow";

// Gunakan Cashflow store
const cashflowStore = useCashflowStore();
const router = useRouter();
const route = useRoute();

// State untuk form update cashflow
const id = route.params.id; // Dapatkan ID cashflow dari parameter URL
const type = ref(""); // Jenis cashflow yang diedit ("income" atau "expense")
const value = ref(0); // Jumlah cashflow
const description = ref(""); // Deskripsi cashflow
const date = ref(""); // Tanggal cashflow
const isSubmitting = ref(false); // Status saat submit form


async function loadCashflow() {
    try {
        const cashflow = await cashflowStore.fetchCashflowDetail(id);
        type.value = cashflow.type.toLowerCase();
        value.value = cashflow.value;
        description.value = cashflow.description;
        date.value = new Date(cashflow.date);
    } catch (error) {
        console.error("Gagal memuat data cashflow:", error);
        await swal.fire("Error", "Data cashflow tidak ditemukan", "error");
        router.push("/arus-kas"); // Redirect jika data tidak ditemukan
    }
}

// Fungsi untuk mengupdate data cashflow
async function updateCashflow() {
    try {
        isSubmitting.value = true;

        // Payload yang akan dikirimkan
        const payload = {
            type: type.value,
            value: Number(value.value), // Konversi ke angka
            description: description.value,
            date: date.value,
        };

        // Panggil fungsi updateCashflow dari store
        await cashflowStore.updateCashflow(id, payload);

        // Redirect ke halaman daftar cashflow
        router.push("/arus-kas");
    } catch (error) {
        console.error("Gagal memperbarui data cashflow:", error);
        await swal.fire("Error", error.message || "Data cashflow gagal diperbarui.", "error");
    } finally {
        isSubmitting.value = false;
    }
}

// Panggil fungsi memuat data saat komponen di-mount
onMounted(loadCashflow);
</script>

<template>
    <div class="w-full">
        <!-- Card Formulir Update Cashflow -->
        <div class="card flex flex-col gap-4 p-6">
            <div class="font-semibold text-xl">Update Cashflow</div>

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
                <InputNumber
                    id="cashflow-value"
                    v-model="value"
                    class="w-full h-12"
                    type="number"
                    placeholder="Masukkan jumlah nominal"
                    :disabled="isSubmitting"
                />
            </div>

            <!-- Deskripsi Cashflow -->
            <div>
                <label for="cashflow-description" class="block font-medium mb-2">Deskripsi</label>
                <textarea
                    id="cashflow-description"
                    v-model="description"
                    class="w-full h-24 p-3 border border-gray-300 rounded-md"
                    placeholder="Masukkan deskripsi cashflow"
                    :disabled="isSubmitting"
                />
            </div>

            <!-- Tanggal Cashflow -->
            <div>
                <label for="cashflow-date" class="block font-medium mb-2">Tanggal Transaksi</label>
                <DatePicker
                    id="cashflow-date"
                    type="date"
                    v-model="date"
                    :showIcon="true"
                    :showButtonBar="true"
                    placeholder="Pilih tanggal transaksi"
                    class="w-full h-12 border border-gray-300 rounded-md"
                    :disabled="isSubmitting"
                />
            </div>

            <!-- Tombol Update Cashflow -->
            <Button
                :disabled="isSubmitting"
                icon="pi pi-sync"
                label="Update Cashflow"
                class="mt-4"
                @click="updateCashflow"
            />
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
