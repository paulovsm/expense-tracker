export interface Transaction {
  transactionId: string
  createdAt: string
  modifiedAt: string
  description: string
  amount: number
  type: string
  attachmentUrl?: string
}
