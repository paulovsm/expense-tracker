import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTransaction, deleteTransaction, getTransactions, patchTransaction, getBalance, searchTransactions } from '../api/transactions-api'
import Auth from '../auth/Auth'
import { Transaction } from '../types/Transaction'

interface TransactionsProps {
  auth: Auth
  history: History
}

interface TransactionsState {
  transactions: Transaction[]
  newTransactionDescription: string
  newTransactionAmount: number
  loadingTransactions: boolean
}

export class Transactions extends React.PureComponent<TransactionsProps, TransactionsState> {
  state: TransactionsState = {
    transactions: [],
    newTransactionDescription: '',
    newTransactionAmount: 0,
    loadingTransactions: true
  }

  handleDecriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionDescription: event.target.value })
  }

  handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionAmount: Number(event.target.value) })
  }

  onEditButtonClick = (transactionId: string) => {
    this.props.history.push(`/transactions/${transactionId}/edit`)
  }

  onTransactionCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newTransaction = await createTransaction(this.props.auth.getIdToken(), {
        description: this.state.newTransactionDescription,
        amount: this.state.newTransactionAmount
      })
      this.setState({
        transactions: [...this.state.transactions, newTransaction],
        newTransactionDescription: '',
        newTransactionAmount: 0
      })
    } catch {
      alert('Transaction creation failed')
    }
  }

  onTransactionDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(this.props.auth.getIdToken(), transactionId)
      this.setState({
        transactions: this.state.transactions.filter(transaction => transaction.transactionId != transactionId)
      })
    } catch {
      alert('Transaction deletion failed')
    }
  }

  // onTransactionCheck = async (pos: number) => {
  //   try {
  //     const transaction = this.state.transactions[pos]
  //     await patchTransaction(this.props.auth.getIdToken(), todo.transactionId, {
  //       description: transaction.description,
  //       amount: transaction.amount
  //     })
  //     this.setState({
  //       todos: update(this.state.transactions, {
  //         [pos]: { done: { $set: !todo.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Transaction deletion failed')
  //   }
  // }

  async componentDidMount() {
    try {
      const transactions = await getTransactions(this.props.auth.getIdToken())
      this.setState({
        transactions,
        loadingTransactions: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Account Transactions</Header>

        {this.renderCreateTransactionInput()}

        {this.renderTransactions()}
      </div>
    )
  }

  renderCreateTransactionInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New transaction',
              onClick: this.onTransactionCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Transaction Description"
            onChange={this.handleDecriptionChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Transaction Amount',
              onClick: this.onTransactionCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Transaction Description"
            onChange={this.handleAmountChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTransactions() {
    if (this.state.loadingTransactions) {
      return this.renderLoading()
    }

    return this.renderTransactionsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Transactions
        </Loader>
      </Grid.Row>
    )
  }

  renderTransactionsList() {
    return (
      <Grid padded>
        {this.state.transactions.map((transaction, pos) => {
          return (
            <Grid.Row key={transaction.transactionId}>
              <Grid.Column width={10} verticalAlign="middle">
                {transaction.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {transaction.amount}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {transaction.type}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(transaction.transactionId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTransactionDelete(transaction.transactionId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {transaction.attachmentUrl && (
                <Image src={transaction.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
