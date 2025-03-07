import { defineStore } from 'pinia';
import { ref } from 'vue';
import ApiService from '@/core/services/ApiService';
import swal from 'sweetalert2';

export const useTransactionStore = defineStore('transaction', () => {
    const transactions = ref([]);
    const transactionDetail = ref(null);
    const loading = ref(true);
    const isSubmitting = ref(false);

    // Fetch all transactions
    async function fetchTransactions({ sortBy = 'created_at', sortOrder = 'desc', limit = 10, page = 1 } = {}) {
        try {
            loading.value = true;
            const queryParams = {
                sortBy,
                sortOrder,
                limit,
                page,
            };

            const response = await ApiService.get('/api/transactions', { params: queryParams });
            transactions.value = response.data.data.transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Gagal mengambil daftar transaksi.');
        } finally {
            loading.value = false;
        }
    }

    // Fetch detail transaction
    async function fetchTransactionDetail(id) {
        try {
            loading.value = true;
            const response = await ApiService.get(`/api/transactions/${id}`);
            transactionDetail.value = response.data.data;
        } catch (error) {
            console.error('Error fetching transaction detail:', error);
            throw new Error('Gagal mengambil detail transaksi.');
        } finally {
            loading.value = false;
        }
    }

    // Add transaction
    async function addTransaction(payload) {
        try {
            isSubmitting.value = true;

            const response = await ApiService.post('/api/transactions', payload);

            // Tambahkan transaksi baru ke daftar lokal
            transactions.value.unshift(response.data.data); // Asumsi API mengembalikan transaksi yang baru ditambahkan

            // Notifikasi sukses
            await swal.fire('Berhasil', 'Transaksi berhasil ditambahkan', 'success');
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw new Error('Gagal menambahkan transaksi.');
        } finally {
            isSubmitting.value = false;
        }
    }

    // Update transaction
    async function updateTransaction(id, payload) {
        try {
            isSubmitting.value = true;

            const response = await ApiService.patch(`/api/transactions/${id}`, payload);

            // Perbarui transaksi di daftar lokal
            const index = transactions.value.findIndex((transaction) => transaction.id === id);
            if (index !== -1) {
                transactions.value[index] = response.data.data;
            }

            // Notifikasi sukses
            await swal.fire('Berhasil', 'Transaksi berhasil diperbarui', 'success');
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw new Error('Gagal memperbarui transaksi.');
        } finally {
            isSubmitting.value = false;
        }
    }

    // Delete transaction
    async function deleteTransaction(id) {
        try {
            // Konfirmasi penghapusan
            const result = await swal.fire({
                title: 'Apakah Anda yakin?',
                text: 'Anda tidak dapat mengembalikan data ini!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Hapus',
                cancelButtonText: 'Batal',
            });

            if (result.isConfirmed) {
                await ApiService.delete(`/api/transactions/${id}`);

                // Hapus dari daftar lokal
                transactions.value = transactions.value.filter((transaction) => transaction.id !== id);

                // Notifikasi sukses
                await swal.fire('Berhasil', 'Transaksi berhasil dihapus', 'success');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw new Error('Gagal menghapus transaksi.');
        }
    }

    return {
        transactions,
        transactionDetail,
        loading,
        isSubmitting,
        fetchTransactions,
        fetchTransactionDetail,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    };
});
