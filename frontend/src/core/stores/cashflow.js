import { defineStore } from "pinia";
import { ref } from "vue";
import ApiService from "@/core/services/ApiService";
import swal from "sweetalert2";

export const useCashflowStore = defineStore("cashflow", () => {
    const cashflows = ref([]);
    const loading = ref(true);
    const isSubmitting = ref(false);

    // Fetch all cashflow data
    async function fetchCashflows(params) {
        try {

            const queryParams = {
                sortBy: 'created_at',
                sortOrder: 'desc'
            };

            loading.value = true;
            const response = await ApiService.get("/api/cashflow", queryParams);
            cashflows.value = response.data.data.cashflows; // Update cashflows state
        } catch (error) {
            console.error("Error fetching cashflows:", error);
            throw new Error("Gagal mengambil data cashflows");
        } finally {
            loading.value = false;
        }
    }

    // Fetch detail of a specific cashflow by id
    async function fetchCashflowDetail(id) {
        try {
            loading.value = true;
            const response = await ApiService.get(`/api/cashflow/${id}`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching cashflow detail:", error);
            throw new Error("Gagal mengambil detail cashflow");
        } finally {
            loading.value = false;
        }
    }

    // Add a new cashflow
    async function addCashflow(payload) {
        try {
            isSubmitting.value = true;
            const response = await ApiService.post("/api/cashflow", payload);
            // Add to the cashflows list
            cashflows.value.unshift(response.data.data);

            // Show success notification
            await swal.fire(
                "Berhasil",
                "Cashflow berhasil ditambahkan",
                "success"
            );
        } catch (error) {
            console.error("Error adding cashflow:", error);
            throw new Error("Gagal menambahkan cashflow");
        } finally {
            isSubmitting.value = false;
        }
    }

    // Update an existing cashflow by id
    async function updateCashflow(id, payload) {
        try {
            isSubmitting.value = true;
            const response = await ApiService.patch(`/api/cashflow/${id}`, payload);

            // Update the local cashflows list
            const index = cashflows.value.findIndex((cashflow) => cashflow.id === id);
            if (index !== -1) {
                cashflows.value[index] = response.data.data;
            }

            // Show success notification
            await swal.fire(
                "Berhasil",
                "Cashflow berhasil diperbarui",
                "success"
            );
        } catch (error) {
            console.error("Error updating cashflow:", error);
            throw new Error("Gagal memperbarui cashflow");
        } finally {
            isSubmitting.value = false;
        }
    }

    // Delete an existing cashflow by id
    async function deleteCashflow(id) {
        try {
            // Confirm deletion
            const result = await swal.fire({
                title: "Apakah Anda yakin?",
                text: "Data ini akan dihapus secara permanen",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, hapus",
                cancelButtonText: "Batal",
            });

            if (result.isConfirmed) {
                await ApiService.delete(`/api/cashflow/${id}`);

                // Remove from the local cashflows list
                cashflows.value = cashflows.value.filter(
                    (cashflow) => cashflow.id !== id
                );

                // Show success notification
                await swal.fire(
                    "Berhasil",
                    "Cashflow berhasil dihapus",
                    "success"
                );
            }
        } catch (error) {
            console.error("Error deleting cashflow:", error);
            throw new Error("Gagal menghapus cashflow");
        }
    }

    // Return the store bindings
    return {
        cashflows,
        loading,
        isSubmitting,
        fetchCashflows,
        fetchCashflowDetail,
        addCashflow,
        updateCashflow,
        deleteCashflow,
    };
});
