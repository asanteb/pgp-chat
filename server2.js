var server = require('http').createServer()

var openpgp = require('openpgp')

var options = {
  userIds: [{name:'Asante Momo', email: 'asante@asante.com'}],
  numBits: 4096,
  passphrase: 'fuck fuck fuck you'
}

openpgp.generateKey(options).then(function(key){
  var priv = key.privateKeyArmored
  var pub = key.publicKeyArmored
  console.log('this is PRIVATE ME ME')
  console.log(priv)
  console.log('this is PUBLIC ME ME')
  console.log(pub)
})

server.listen(3001)
console.log('Connected to port 3001')
