export interface MerchantDto {
  id?: string;
  merchantId?: string;
  userId?: string;
  businessName: string;
  shopLocation: string;
  email: string;
  firstname?: string;
  lastname?: string;
  schoolCode: string;
  accountNumber?: string;
  bankCode?: string;
  bankName?: string;
  isApproved: boolean;
  walletNumber?: string;
  createdAt?: string;
}

export interface ApproveMerchantQuery {
  merchantId: string;
}
