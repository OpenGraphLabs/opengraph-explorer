export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  message: string;
  txHash?: string;
  error?: string;
}

export interface TransactionStatusDisplayProps {
  status: TransactionStatus;
  onDismiss?: () => void;
  onRetry?: () => void;
  showTxLink?: boolean;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  data?: any;
} 