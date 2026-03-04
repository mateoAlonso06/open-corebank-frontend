// ── Auth ─────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TwoFactorRequiredResult {
  sessionToken: string;
  maskedEmail: string;
  expirySeconds: number;
}

export interface LoginResult {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'BRANCH_MANAGER' | 'SUPPORT' | 'COMPLIANCE' | 'AUDITOR';
  token: string;
  lastLoginAt: string | null;
  requiresTwoFactor: boolean;
  twoFactorData?: TwoFactorRequiredResult;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface RegisterResult {
  id: string;
  email: string;
}

export interface VerifyTwoFactorRequest {
  sessionToken: string;
  code: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangeUserPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ToggleTwoFactorRequest {
  enable: boolean;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
}

// ── Customers ────────────────────────────────────────

export interface CustomerResult {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  customerSince: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface CustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

// ── Accounts ─────────────────────────────────────────

export type AccountType = 'SAVINGS' | 'CHECKING' | 'INVESTMENT';

export interface AccountResult {
  id: string;
  customerId: string;
  accountNumber: string;
  alias: string;
  accountType: AccountType;
  currency: string;
  balance: number;
  availableBalance: number;
}

export interface AccountBalanceResult {
  accountId: string;
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: string;
}

export interface AccountPublicResult {
  alias: string;
  ownerName: string;
  ownerDocumentNumber: string;
  currency: string;
  accountType: string;
}

export interface CreateAccountRequest {
  accountType: AccountType;
  currency: string;
}

// ── Transfers ────────────────────────────────────────

export type TransferCategory =
  | 'FOOD'
  | 'TRANSPORTATION'
  | 'ENTERTAINMENT'
  | 'SERVICES'
  | 'HEALTH'
  | 'EDUCATION'
  | 'SHOPPING'
  | 'RECHARGES'
  | 'TAXES'
  | 'OTHERS';

export interface TransferMoneyRequest {
  fromAccountId: string;
  toAlias?: string;
  toAccountNumber?: string;
  amount: number;
  currency: string;
  feeAmount?: number;
  feeCurrency?: string;
  category?: TransferCategory;
  description?: string;
  idempotencyKey: string;
}

export interface AccountInfo {
  alias: string;
  partialAccountNumber: string;
}

export interface TransferReceipt {
  transferId: string;
  referenceNumber: string;
  category: TransferCategory;
  amount: number;
  currency: string;
  fee: number;
  description: string;
  executedAt: string;
  source: AccountInfo;
  destination: AccountInfo;
}

export interface TransferResult {
  transferId: string;
  sourceAccountId: string;
  targetAccountId: string;
  category: TransferCategory;
  amount: number;
  creditTransactionId: string;
  debitTransactionId: string;
  feeTransactionId: string;
}

// ── Transactions ─────────────────────────────────────

export interface TransactionResult {
  id: string;
  accountId: string;
  transactionType: string;
  amount: number;
  amountFee: number;
  currency: string;
  balanceAfter: number;
  description: string;
  referenceNumber: string;
  executedAt: string;
  status: string;
}

export interface MoneyOperationResult {
  transactionId: string;
  referenceNumber: string;
  operationType: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  accountNumber: string;
  accountAlias: string;
  description: string;
  status: string;
  executedAt: string;
}

export interface DepositMoneyRequest {
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export interface WithdrawMoneyRequest {
  amount: number;
  currency: string;
  idempotencyKey: string;
}

// ── Pagination ───────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
