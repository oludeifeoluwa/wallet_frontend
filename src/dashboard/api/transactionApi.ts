import { dashboardApi } from './client';
import { TransactionDto, StatementQuery } from '../types/transaction';

export const transactionApi = {
  async getTransactionHistory(): Promise<TransactionDto[]> {
    const res = await dashboardApi<any>('/Transaction/history', { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.transactions)) return res.transactions;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getWalletTransactions(): Promise<TransactionDto[]> {
    const res = await dashboardApi<any>('/Wallet/Transactions', { method: 'GET' });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.transactions)) return res.transactions;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getWalletStatement(query: StatementQuery = {}): Promise<{
    items: TransactionDto[];
    totalCount?: number;
    pageNumber?: number;
    pageSize?: number;
  }> {
    const params: Record<string, string | number | undefined> = {};
    if (query.PageNumber) params.PageNumber = query.PageNumber;
    if (query.PageSize) params.PageSize = query.PageSize;
    if (query.StartDate) params.StartDate = query.StartDate;
    if (query.EndDate) params.EndDate = query.EndDate;
    if (query.Type) params.Type = query.Type;
    if (query.Status) params.Status = query.Status;
    if (query.MinAmount) params.MinAmount = query.MinAmount;
    if (query.MaxAmount) params.MaxAmount = query.MaxAmount;
    if (query.Search) params.Search = query.Search;

    const res = await dashboardApi<any>('/Wallet/Statement', {
      method: 'GET',
      params,
    });

    if (Array.isArray(res)) {
      return { items: res, totalCount: res.length };
    }
    if (res && Array.isArray(res.items)) {
      return {
        items: res.items,
        totalCount: res.totalCount || res.total || res.items.length,
        pageNumber: res.pageNumber,
        pageSize: res.pageSize,
      };
    }
    if (res && Array.isArray(res.data)) {
      return {
        items: res.data,
        totalCount: res.totalCount || res.total || res.data.length,
      };
    }
    return { items: [] };
  },
};
