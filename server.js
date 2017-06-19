var http = require('http')
var fs = require('fs')
var express = require('express')
var app = express()
var favicon = require('serve-favicon');

var options = {
  key: fs.readFileSync('./keys/key.pem').toString(),
  cert: fs.readFileSync('./keys/cert.pem').toString()
}

var port = process.env.PORT || 5000

var server = http.createServer(app)

var io = require('socket.io')(server)

var users = []
var online_users = []
var o_obj = {
  name: ''
}
var user_obj = {
  nick: '',
  public_pgp: ''
}

var s_users = {
  id: '',
  nick: '',
  pgp: ''
}

var privkey = ['-----BEGIN PGP PRIVATE KEY BLOCK-----',
'Version: OpenPGP.js v2.3.5',
'Comment: http://openpgpjs.org',
'',
'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',
'f+6h15fRjKZG4+BgAmhNllSGNA==',
'=S/pg',
'-----END PGP PRIVATE KEY BLOCK-----'].join('\n')


var pubkey = ['-----BEGIN PGP PUBLIC KEY BLOCK-----',
'Version: OpenPGP.js v2.3.5',
'Comment: http://openpgpjs.org',
'',
'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',
'',
'=FU18',
'-----END PGP PUBLIC KEY BLOCK-----'].join('\n')

/////////////////////////
/////////////
//examplePGP
//console.log(privkey)
//console.log(pubkey)

function yeh(){
  io.sockets.emit('/chat', {text: 'sup man', usr: 'server'})
}

io.sockets.on('connection', function(user){

  console.log('Client '+ user.id + 'has joined')
  user.emit('/chat', {text: 'Welcome to the chat', usr:'server'})

  user.on('/chat', function (msg){
      io.sockets.emit('/chat', msg)
      console.log(user.id + ' says ' + msg.text)
  })



  user.on('myself', function(obj){

    console.log(obj)
    console.log(users)

    var new_obj = {
      id: user.id,
      nick: obj.nick,
      pubkey: obj.pubkey
    }

    users.push(new_obj)

    var p_obj = {
      pub: pubkey,
      priv: privkey
    }
    io.sockets.emit('online', users)
    io.sockets.emit('return', p_obj)
  })

  user.on('disconnect', function(){
    for (var i = 0; i < users.length; i++){
      if (users[i].id == user.id){
        users.splice(i, 1)
      }
    }
    io.sockets.emit('online', users)
    console.log(user.id + ' has left the server')
  })
})
console.log('THIS IS DIRNAME', __dirname)
app.use(express.static(__dirname + '/build'))
app.use(favicon(__dirname + '/build/favicon.ico'))

app.get('/favicon.ico', function(req, res){
  //res.sendFile(__dirname + '/build/index.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/build/index.html');
});

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

//server.listen(3001)


server.listen(port)
console.log('Connected to port ' + port)
