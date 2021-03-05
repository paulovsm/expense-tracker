import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  GridColumn,
  Label
} from 'semantic-ui-react'
import { threadId } from 'worker_threads'

import { createTransaction, deleteTransaction, getTransactions, patchTransaction, getBalance, searchTransactions } from '../api/transactions-api'
import Auth from '../auth/Auth'
import { Transaction } from '../types/Transaction'
import { Account } from '../types/Account'

interface TransactionsProps {
  auth: Auth
  history: History
}

interface TransactionsState {
  transactions: Transaction[]
  account: Account
  newTransactionDescription: string
  newTransactionAmount: number
  loadingTransactions: boolean,
  searchTerm: string
}

export class Transactions extends React.PureComponent<TransactionsProps, TransactionsState> {
  state: TransactionsState = {
    transactions: [],
    account: {} as Account,
    newTransactionDescription: '',
    newTransactionAmount: 0,
    loadingTransactions: true,
    searchTerm: ''
  }

  handleDecriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionDescription: event.target.value })
  }

  handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionAmount: Number(event.target.value) })
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value })
  }

  onEditButtonClick = (transactionId: string) => {
    this.props.history.push(`/transactions/${transactionId}/edit`)
  }

  onTransactionCreate = async () => {
    try {
      const newTransaction = await createTransaction(this.props.auth.getIdToken(), {
        description: this.state.newTransactionDescription,
        amount: this.state.newTransactionAmount
      })

      const newTransactions = [...this.state.transactions, newTransaction]

      const amounts = newTransactions.map(transaction => transaction.amount)

      const balance = parseFloat(amounts
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2));

      const income = parseFloat(amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2))

        const expense = parseFloat(amounts
          .filter(item => item < 0)
          .reduce((acc, item) => (acc += item), 0)
          .toFixed(2))

      this.setState({
        transactions: newTransactions,
        newTransactionDescription: '',
        newTransactionAmount: 0,
        account: {
          balance: balance,
          income: income,
          expense: expense
        }
      })
    } catch {
      alert('Transaction creation failed')
    }
  }

  onTransactionSearch = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {

      const searchTerm = this.state.searchTerm
      var transactions

      if (searchTerm === "" ) {
        transactions = await getTransactions(this.props.auth.getIdToken())
      } else {
        transactions = await searchTransactions(this.props.auth.getIdToken(), searchTerm)
      }

      const filteredTransactions = transactions.filter(trans => !!trans)

      console.log(filteredTransactions)

      this.setState({
        transactions: filteredTransactions
      })
      
    } catch (error) {
      console.log("Error searching transactions", error)
      alert('Transaction searching failed')
    }
  }

  onTransactionDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(this.props.auth.getIdToken(), transactionId)
      const deletedTransaction = this.state.transactions.filter(transaction => transaction.transactionId == transactionId)[0]

      const newTransactions = this.state.transactions.filter(transaction => transaction.transactionId != transactionId)

      const amounts = newTransactions.map(transaction => transaction.amount)

      const balance = parseFloat(amounts
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2));

      const income = parseFloat(amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2))

        const expense = parseFloat(amounts
          .filter(item => item < 0)
          .reduce((acc, item) => (acc += item), 0)
          .toFixed(2))

      this.setState({
        transactions: newTransactions,
        account: {
          balance: balance,
          income: income,
          expense: expense
        }
      })
    } catch {
      alert('Transaction deletion failed')
    }
  }

  addDefaultSrc = (event: React.ChangeEvent<HTMLImageElement>) => {
    event.target.src = 'https://via.placeholder.com/295x295?text=Image+Not+Available'
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
      const account = await getBalance(this.props.auth.getIdToken())

      this.setState({
        transactions,
        account,
        loadingTransactions: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Expense Tracker</Header>

        <Header as="h4" textAlign="center">Your Balance</Header>
        <Header as="h1" textAlign="center">${this.state.account.balance}</Header>

        {this.renderIncomeExpense()}

        <Header as="h1">Add new transaction</Header>

        {this.renderCreateTransactionInput()}

        <Header as="h1">Account Transactions</Header>
        {this.renderSearchTransactionsInput()}

        {this.renderTransactions()}
      </div>
    )
  }

  renderIncomeExpense() {
    return (<div className="inc-exp-container">
      <div>
        <h4>Income</h4>
        <p className="money plus">${this.state.account.income}</p>
      </div>
      <div>
        <h4>Expense</h4>
        <p className="money minus">${this.state.account.expense}</p>
      </div>
    </div>
    )
  }

  renderSearchTransactionsInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search',
              onClick: this.onTransactionSearch
            }}
            fluid
            actionPosition="left"
            placeholder="Search transactions by key owner..."
            onChange={this.handleSearchChange}
          >
          </Input>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCreateTransactionInput() {
    return (
      
      <Grid.Row>
        <Grid.Column width={8}>
          <Label>Description</Label>
          <Input
            fluid
            placeholder="Enter Description..."
            onChange={this.handleDecriptionChange}
          />
        </Grid.Column>
        <Grid.Column width={8}>
        <Label>Amount (negative - expense, positive - income)</Label>
          <Input
            fluid
            placeholder="Enter Amount..."
            onChange={this.handleAmountChange}
            type="number"
          >
            <Label basic>$</Label>
            <input />
            </Input>
        </Grid.Column>  
        <Grid.Column width={1}>
          <Button
            icon
            color="teal"
            onClick={() => this.onTransactionCreate()}
          >
            New Transaction
            <Icon name="add" />
          </Button>
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
              <Grid.Column width={8} verticalAlign="middle">
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
                <Image src={transaction.attachmentUrl} size="small" wrapped onError={this.addDefaultSrc} />
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
