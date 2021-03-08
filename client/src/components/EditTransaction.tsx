import * as React from 'react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchTransaction } from '../api/transactions-api'
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
  Label,
  Form
} from 'semantic-ui-react'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTransactionProps {
  match: {
    params: {
      transactionId: string
    }
  }
  auth: Auth
}

interface EditTransactionState {
  file: any
  uploadState: UploadState,
  newTransactionDescription: string,
    newTransactionAmount: number,
}

export class EditTransaction extends React.PureComponent<
  EditTransactionProps,
  EditTransactionState
> {
  state: EditTransactionState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    newTransactionDescription: '',
    newTransactionAmount: 0,
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleDecriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionDescription: event.target.value })
  }

  handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTransactionAmount: Number(event.target.value) })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.transactionId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  onTransactionUpdate = async () => {
    try {
      const newTransaction = await patchTransaction(this.props.auth.getIdToken(), this.props.match.params.transactionId, {
        description: this.state.newTransactionDescription,
        amount: this.state.newTransactionAmount
      })

      this.setState({
        newTransactionDescription: '',
        newTransactionAmount: 0,
      })

      alert('Transaction was updated!')
    } catch {
      alert('Transaction update failed')
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Update transaction</Header>

        {this.renderUpdateTransactionInput()}

        <h1>Upload transaction receipt</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderUpdateTransactionInput() {
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
            onClick={() => this.onTransactionUpdate()}
          >
            Update
            <Icon name="save" />
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
