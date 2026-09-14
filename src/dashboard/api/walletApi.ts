import { dashboardApi } from './client';
import { WalletDto } from '../types/transaction';

export const walletApi = {
  async getWallet(): Promise<WalletDto> {
    const res = await dashboardApi<WalletDto>('/Wallet/Wallet', { method: 'GET' });
    return res;
  },

  async searchWalletNumber(walletNumber: string): Promise<WalletDto> {
    return dashboardApi<WalletDto>('/Wallet/Search/WalletNumber', {
      method: 'POST',
      body: JSON.stringify({ walletNumber: walletNumber.trim() }),
    });
  },

  async lockOrUnlockWallet(walletNumber: string): Promise<any> {
    return dashboardApi('/Wallet/lockOrUnlock', {
      method: 'POST',
      body: JSON.stringify({ walletNumber: walletNumber.trim() }),
    });
  },
};
