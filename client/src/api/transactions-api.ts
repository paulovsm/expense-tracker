import { apiEndpoint } from '../config'
import { Transaction } from '../types/Transaction';
import { Account } from '../types/Account';
import { CreateTransactionRequest } from '../types/CreateTransactionRequest';
import Axios from 'axios'
import { UpdateTransactionRequest } from '../types/UpdateTransactionRequest';

export async function getTransactions(idToken: string): Promise<Transaction[]> {
  console.log('Fetching user account transactions')

  const response = await Axios.get(`${apiEndpoint}/account/transactions`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Transactions:', response.data)
  return response.data.items
}

export async function createTransaction(
  idToken: string,
  newTransaction: CreateTransactionRequest
): Promise<Transaction> {
  const response = await Axios.post(`${apiEndpoint}/account/transaction`,  JSON.stringify(newTransaction), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTransaction(
  idToken: string,
  transactionId: string,
  updatedTransaction: UpdateTransactionRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/account/transaction/${transactionId}`, JSON.stringify(updatedTransaction), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTransaction(
  idToken: string,
  transactionId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/account/transaction/${transactionId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  transactionId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/account/transaction/${transactionId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function getBalance(
  idToken: string,
): Promise<Account> {
  const response = await Axios.get(`${apiEndpoint}/account`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data
}

export async function searchTransactions(
  idToken: string, 
  searchTerm: string
): Promise<Transaction[]> {
  console.log('Searching transactions by term')

  const response = await Axios.get(`${apiEndpoint}/account/transactions/search?q=` + searchTerm, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Transactions:', response.data)
  return response.data.items
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
