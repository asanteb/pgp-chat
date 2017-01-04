import React, { PropTypes } from 'react'
import Paper from 'material-ui/Paper'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {deepOrange500} from 'material-ui/styles/colors'
import RaisedButton from 'material-ui/RaisedButton'

import cookie from 'react-cookie'
import TextField from 'material-ui/TextField'
import AutoComplete from 'material-ui/AutoComplete'

//import openpgp from 'openpgp'
openpgp.initWorker({ path:'./openpgp.worker.js' })
openpgp.config.aead_protect = true

var socket = io() // production
//var socket = io.connect('http://localhost:5000') // testing

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

const style = {
  box: {
    height: '60%',
    width: '100%',
    margin: 0,
    textAlign: 'center',
    display: 'inline-block',
    backgroundColor: 'black'
  },
  inner: {
    height: '75%',
    width: '100%',
    backgroundColor: 'white',
    overflowY: 'scroll'
  },
  input: {
    height: '25%',
    width: '100%',
    backgroundColor: '#d3d3d3',
  }
}


class PGP extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      private: 'not yet generated',
      public: 'not yet generated',
      uMsg: '',
      nick: '',
      rString: '',
      passphrase: '',
      editable: false,
    }
  }

  serverReturn = (data) =>  {
    var openpgp = window.openpgp

    var privKey = openpgp.key.readArmored(data.priv).keys[0]
    var success = privKey.decrypt('examplePGP')
    console.log('SUCCESS', success)

    sessionStorage.setItem('serverPub', data.pub)
    sessionStorage.setItem('serverPriv', data.priv)
    sessionStorage.setItem('serverPassphrase', 'examplePGP')

  }

  generate = () =>{

    console.log('generating key')

    var openpgp = window.openpgp;

      this.setState({
        private: 'loading please wait',
        public: 'loading please wait'
      })
      console.log(this.state.rString)
      console.log(this.state.nick)

      var options = {
        numBits: 4096,
        userIds: [{ name: this.state.nick, email: this.state.rString }],
        passphrase: this.state.passphrase
      }

      openpgp.generateKey(options).then((response) => {
        var privkey = response.privateKeyArmored
        var pubkey = response.publicKeyArmored
        sessionStorage.setItem('pub', pubkey)
        sessionStorage.setItem('priv', privkey)
        sessionStorage.setItem('passphrase', this.state.passphrase)
        sessionStorage.setItem('nick', this.state.nick)

        this.setState({
          private: privkey,
          public: pubkey
        })

        var myself = {
          nick: this.state.nick,
          pubkey: pubkey
        }

        socket.emit('myself', myself)
        socket.on('return', this.serverReturn)

        console.log(response)

        //console.log(privkey)
        //console.log(pubkey)

        this.setState({editable: true})

      });

  }

  saveKeys = () => {
    if (sessionStorage.getItem('priv') !== null){
      this.setState({private : sessionStorage.getItem('priv')})
      this.setState({public : sessionStorage.getItem('pub')})

      var myself = {
        nick: sessionStorage.getItem('nick'),
        pubkey: sessionStorage.getItem('pub')
      }

      socket.emit('myself', myself)
      socket.on('return', this.serverReturn)
    }

    else {
      this.setState({private: 'No saved keys'})
      this.setState({public: 'No saved keys'})
    }
  }

  removeCookie = () =>{

    this.setState({
      public: '',
      private: '',
      nick: '',
      passphrase: '',
      rString: '',
      editable: false
    })

    sessionStorage.clear();
    console.log('Deleted')
  }

  rStringHandler = (event) => {
    this.setState({rString : event.target.value})
  }

  passphraseHandler = (event) => {
    this.setState({passphrase : event.target.value})
  }

  nickHandler = (event) => {
    this.setState({nick : event.target.value})
  }


  render(){

    return(
      <div>

        <h1>Settings</h1>
        <TextField
          hintText='Enter Nickname'
          id='nickname'
          width='70%'
          onChange={this.nickHandler}
          value={this.state.nick}
          disabled={this.state.editable}
        /><br/>

        <TextField
          hintText='Enter Email (will not be used for storing)'
          id='randoString'
          width='70%'
          onChange={this.rStringHandler}
          value={this.state.rString}
          disabled={this.state.editable}
        /><br/>

        <TextField
          hintText='Passphrase'
          id='passphrase'
          width='70%'
          onChange={this.passphraseHandler}
          value={this.state.passphrase}
          type={'password'}
          disabled={this.state.editable}
        /><br/>

        <RaisedButton
          label='Generate'
          onTouchTap={this.generate}
        />
        <RaisedButton
          label='Load Saved Session'
          onTouchTap={this.saveKeys}
        />
        <RaisedButton
          label='Delete Session'
          onTouchTap={this.removeCookie}
        />


        <h1>Generated PGP Keys</h1>
        <h2>Private</h2>
          <TextField
            multiLine={true}
            rows={4}
            rowsMax={12}
            readOnly='readonly'
            value={this.state.private}
            id='public'
            width='70%'
            underlineShow={false}
            style={{width:'60%'}}
          />

        <h2>Public</h2>
          <TextField
            multiLine={true}
            rows={4}
            rowsMax={12}
            readOnly='readonly'
            value={this.state.public}
            id='public'
            width='70%'
            underlineShow={false}
            style={{width:'60%'}}
          />
      </div>
    )
  }
}

class Message extends React.Component {
  render() {
      return (
          <div className="message">
              <strong>{this.props.usr}: </strong>
              <span>{this.props.text}</span>
          </div>
      )
  }
}

class MessageList extends React.Component {
  render() {
    return (
      <div className='messages'>
        <h4><font color='pink'>Lame Chat</font></h4>
          {
            this.props.messages.map((message, i) => {
                return (
                  <Message
                   key={i}
                   usr={message.usr}
                   text={message.text}
                   for={message.for}
                  />
                )
            })
          }
      </div>
    )
  }
}

class MessageForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      text: '',
      usr: sessionStorage.getItem('nick'),
      for: '',
      dataSource: [],
      searchText: ''
    }
  }

  handleSubmit = (event) => {
    var openpgp = window.openpgp
    var intendedFor
    var pub = sessionStorage.getItem('pub')
    var priv = sessionStorage.getItem('priv')
    var serverPriv = sessionStorage.getItem('serverPriv')
    var serverPub = sessionStorage.getItem('serverPub')
    var sText = this.state.searchText
    //var success = priv.keys[0].decrypt('super long and hard to guess secret');

    if (event.key === 'Enter'){
      console.log(sText)
      var user = sessionStorage.getItem('nick')

      if (sText.charAt(0) == '@'){
        for (var i = 0; i < sText.length; i++){
          if (sText.charAt(i) == ' '){
            intendedFor = sText.substring(1, i)
            console.log(intendedFor)
            i = sText.length
          }
        }

        var userList = sessionStorage.getItem('userList')
        var uList = JSON.parse(userList)

        console.log('COOKIE LOG', uList)

        function findUser(data){
          return data.nick === intendedFor
        }
        console.log('name found!: ', uList.find(findUser))

        var u_obj = uList.find(findUser)

        var options = {
          data: sText,
          publicKeys: openpgp.key.readArmored(u_obj.pubkey).keys
        }

        var options_me = {
          data: sText,
          publicKeys: openpgp.key.readArmored(pub).keys
        }

        openpgp.encrypt(options).then((response) => {

          var message = {
            usr : user,
            text : response.data,
            for: intendedFor
          }
          console.log('MessageForm', message)
          this.props.onMessageSubmit(message)
        })

        openpgp.encrypt(options_me).then((response) => {

          var message = {
            usr : user,
            text : response.data,
            for: intendedFor,
            ref: true
          }
          console.log('MessageForm', message)
          this.props.onMessageSubmit(message)
        })

        console.log('Message sent')
        this.setState({ searchText: '' })
      }

      else {
        intendedFor = 'global'
        var options = {
          data: sText,
          publicKeys: openpgp.key.readArmored(serverPub).keys
        }

        openpgp.encrypt(options).then((response) => {

          var message = {
            usr : user,
            text : response.data,
            for: intendedFor
          }
          console.log('MessageForm', message)
          this.props.onMessageSubmit(message)
        })

        console.log('Message sent')
        this.setState({searchText: '' })
        console.log(sText)
      }

    }
  }

  componentWillMount = () => {

    var userList = JSON.parse(sessionStorage.getItem('userList'))
    var users = []

    if (userList != null){
      for(var i = 0; i < userList.length; i++){
        var user = '@'+userList[i].nick
        users.push(user)
      }
      console.log(users)
      this.setState({
        dataSource: users
      })

    }
  }

  handleDataSource = () => {

    var userList = JSON.parse(sessionStorage.getItem('userList'))
    var users = []
    for(var i = 0; i < userList.length; i++){
      var user = '@'+userList[i].nick
      users.push(user)
    }
    console.log(users)
    this.setState({
      dataSource: users,
    })
  }

  handleUpdateInput = (searchText) => {
    //if (searchText.charAt(0) == '@')
    this.setState({
      searchText: searchText,
      //dataSource: JSON.parse(sessionStorage.getItem('userList'))
    })
  }

  render() {
      return(
          <div className='message_form'>
            <br/>
                <AutoComplete
                  hintText='Message #global'
                  searchText={this.state.searchText}
                  onUpdateInput={this.handleUpdateInput}
                  onNewRequest={this.handleDataSource}
                  dataSource={this.state.dataSource}
                  filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
                  onKeyDown={this.handleSubmit}
                />

          </div>
      )
  }
}

class User extends React.Component {
  render() {
      return (
          <div className="user">
              <strong>{this.props.usr} </strong>
          </div>
      )
  }
}

class UserList extends React.Component {
  render() {
    return (
      <div className='users'>
        <h4><font color='white'>Online Users</font></h4>
          {
            this.props.users.map((user, i) => {
                return (
                  <User
                   key={i}
                   usr={user.nick}
                  />
                )
            })
          }
      </div>
    )
  }
}

//var usrs = ['yamoshoto']

export default class Main extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      messages: [],
      users: []
      //usr: usrs
    }
  }

  componentDidMount(){
    socket.on('/chat', this.msgReciever)
    socket.on('online', this.usrReciever)
  }

  usrReciever = (people) =>{
    this.setState({users:people})
    var peep = JSON.stringify(people)
    sessionStorage.setItem('userList', peep)
    console.log(people)
  }

  msgReciever = (lite) => {
    console.log('incoming ',lite)
    var duplicate
    if (lite.text != "Welcome to this gay ass chat"){
      var encrypted = lite.text
      var openpgp = window.openpgp

      var privKey = openpgp.key.readArmored(sessionStorage.getItem('priv')).keys[0]
      var serverPrivKey = openpgp.key.readArmored(sessionStorage.getItem('serverPriv')).keys[0]

      if (lite.for == 'global'){
        var globalSuccess = serverPrivKey.decrypt(sessionStorage.getItem('serverPassphrase'))
        console.log('GLOBAL SUCCESS ', globalSuccess)

        var options = {
          message: openpgp.message.readArmored(encrypted),
          privateKey: serverPrivKey
        }
        var user = lite.usr
        openpgp.decrypt(options).then((response) => {
          var message = {
            text: response.data,
            usr: user,
            for: lite.for
          }

          var messages = this.state.messages
          messages.push(message)
          this.setState({messages})

        })
      }

      else if (lite.for == sessionStorage.getItem('nick')){
        var mSuccess = privKey.decrypt(sessionStorage.getItem('passphrase'))
        console.log('MENTION SUCCESS ', mSuccess)

        var options = {
          message: openpgp.message.readArmored(encrypted),
          privateKey: privKey
        }
        var user = lite.usr
        openpgp.decrypt(options).then((response) => {
          var message = {
            text: response.data,
            usr: user,
            for: lite.for
          }

          var messages = this.state.messages
          messages.push(message)
          this.setState({messages})

        })
      }

      else if (lite.usr == sessionStorage.getItem('nick')){
        var sSuccess = privKey.decrypt(sessionStorage.getItem('passphrase'))
        console.log('SELF SUCCESS ', sSuccess)

        var options = {
          message: openpgp.message.readArmored(encrypted),
          privateKey: privKey
        }
        var user = lite.usr
        openpgp.decrypt(options).then((response) => {
          var message = {
            text: response.data,
            usr: user,
            for: lite.for
          }

          var messages = this.state.messages
          messages.push(message)
          this.setState({messages})

        })
      }

      else{
        if (!lite.ref){
          var message = {
            text: 'message was encrypted for '+ lite.for,
            usr: lite.usr,
            for: 'global'
          }

          var messages = this.state.messages
          messages.push(message)
          this.setState({messages})
        }
      }
        //console.log('SECRET KEY WORKS IF ', privKey.decrypt(sessionStorage.getItem('passphrase'))) //this log also decrypts

      }
  }

  handleMessageSubmit = (message) => {

      socket.emit('/chat', message)

  }

render() {
  socket.on('/chat', function(data){
    console.log('Message Recieved')
  })
  return (
    <MuiThemeProvider muiTheme={muiTheme}>
      <div className='container'>
      <div className='chat'>
      <Paper style={style.box} zDepth={1}>
        <Paper style={style.inner} zDepth={1}>
          <MessageList
            messages={this.state.messages}
          />
        </Paper>
        <Paper style={style.input} zDepth={1}>
          <MessageForm
            onMessageSubmit={this.handleMessageSubmit}
          />
        </Paper>
      </Paper>
    </div>
    <div className='flex-item'>
      <PGP/>
    </div>
      <div className='flex-item2'>
        <UserList
          users={this.state.users}
        />
      </div>
    </div>
    </MuiThemeProvider>

  )
}
}
