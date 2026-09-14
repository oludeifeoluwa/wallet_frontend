export type TransactionStatus = 'Pending' | 'Successful' | 'Failed' | 'Reversed';

export type TransactionType = 'Deposit' | 'Transfer' | 'Withdrawal' | 'QRPayment' | 'ScantoPay';

export interface TransactionDto {
  id?: string;
  transactionId?: string;
  reference?: string;
  amount: number;
  type: TransactionType | string;
  status: TransactionStatus | string;
  description?: string;
  createdAt?: string;
  date?: string;
  timestamp?: string;
  senderWalletNumber?: string;
  receiverWalletNumber?: string;
  senderName?: string;
  receiverName?: string;
  walletNumber?: string;
  schoolCode?: string;
  fee?: number;
  channel?: string;
}

export interface StatementQuery {
  PageNumber?: number;
  PageSize?: number;
  StartDate?: string;
  EndDate?: string;
  Type?: TransactionType;
  Status?: TransactionStatus;
  MinAmount?: number;
  MaxAmount?: number;
  Search?: string;
}

export interface WalletDto {
  id?: string;
  walletNumber: string;
  balance?: number;
  availableBalance?: number;
  ledgerBalance?: number;
  currency?: string;
  isLocked?: boolean;
  isActive?: boolean;
  ownerName?: string;
  ownerEmail?: string;
  role?: string;
  schoolCode?: string;
  createdAt?: string;
}

export interface WalletLockRequest {
  walletNumber: string;
}
