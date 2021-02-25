/**
 * Fields in a request to update a single Transaction.
 */
export interface UpdateTransactionRequest {
  description: string
  amount: number
  type: string
}