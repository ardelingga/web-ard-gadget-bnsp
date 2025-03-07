import { defineStore } from 'pinia';
import { ref } from 'vue';
import ApiService from '@/core/services/ApiService';
import swal from 'sweetalert2';

export const useDashboardStore = defineStore('dashboard', () => {
    // State untuk menyimpan data dashboard
    const totalTransactions = ref(0);
    const totalProfit = ref(0);
    const totalIncome = ref(0);
    const totalExpense = ref(0);
    const revenueData = ref({});
    const loading = ref(true);

    // Fungsi untuk mengambil total transaction
    async function fetchTotalTransactions() {
        try {
            loading.value = true; // Set loading state
            const response = await ApiService.get('/api/dashboard/total-transactions');

            totalTransactions.value = response.data.data.total_transaction;
        } catch (error) {
            console.error('Error fetching total transactions:', error);
            await swal.fire('Error', 'Gagal mengambil Total Transactions', 'error');
        } finally {
            loading.value = false;
        }
    }

    // Fungsi untuk mengambil total profit
    async function fetchTotalProfit() {
        try {
            loading.value = true;
            const response = await ApiService.get('/api/dashboard/total-profit');
            totalProfit.value = response.data.data.total_profit;
        } catch (error) {
            console.error('Error fetching total profit:', error);
            await swal.fire('Error', 'Gagal mengambil Total Profit', 'error');
        } finally {
            loading.value = false;
        }
    }

    // Fungsi untuk mengambil total income/pemasukan
    async function fetchTotalIncome() {
        try {
            loading.value = true;
            const response = await ApiService.get('/api/dashboard/total-income');
            totalIncome.value = response.data.data.total_income;
        } catch (error) {
            console.error('Error fetching total income:', error);
            await swal.fire('Error', 'Gagal mengambil Total Income', 'error');
        } finally {
            loading.value = false;
        }
    }

    // Fungsi untuk mengambil total expense/pengeluaran
    async function fetchTotalExpense() {
        try {
            loading.value = true;
            const response = await ApiService.get('/api/dashboard/total-expense');
            totalExpense.value = response.data.data.total_expense;
        } catch (error) {
            console.error('Error fetching total expense:', error);
            await swal.fire('Error', 'Gagal mengambil Total Expense', 'error');
        } finally {
            loading.value = false;
        }
    }

    // Fungsi untuk memuat semua data dashboard sekaligus
    async function fetchDashboardData() {
        try {
            loading.value = true;
            // Jalankan semua fungsi fetch secara bersamaan
            await Promise.all([fetchTotalTransactions(), fetchTotalProfit(), fetchTotalIncome(), fetchTotalExpense()]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            await swal.fire('Error', 'Gagal memuat data dashboard', 'error');
        } finally {
            loading.value = false;
        }
    }

    async function fetchRevenueData() {
        try {
            const response = await ApiService.get('api/dashboard/revenue');
            if (response.data.status === 'success') {
                revenueData.value = response.data.data;
                return response.data.data;
            } else {
                await swal.fire('Error', 'Gagal mengambil data Revenue', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        }
    }

    return {
        totalTransactions,
        totalProfit,
        totalIncome,
        totalExpense,
        loading,
        fetchTotalTransactions,
        fetchTotalProfit,
        fetchTotalIncome,
        fetchTotalExpense,
        fetchDashboardData,
        fetchRevenueData
    };
});
