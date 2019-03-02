/*eslint no-console: "off"*/

/*
  Start SC listening for incoming messages with this
  o = OSCFunc({arg msg, time, addr, recvPort; msg.unfoldOSC.postln; }, '/play/pattern');
  Send stuff to super collider like this
  echo "foo -> bar[1 2   3 2]" | npm run cli
*/

const atomiix = require('../lib/atomiix.min.js').default;

const osc = require('osc-min');
const dgram = require('dgram');

const sock = dgram.createSocket('udp4');

const scServer = 'localhost';
const scPort = 57120;

process.stdin.setEncoding('utf8');

let input = '';

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    input += chunk;
  }
});

process.stdin.on('end', function() {
  const ast = atomiix.parser.parse(input);
  const oscMessages = atomiix.transport.toOSC(ast);
  Promise.all(
    oscMessages.map(om => {
      return new Promise(resolve => {
        const msg = osc.toBuffer(om);
        sock.send(msg, 0, msg.length, scPort, scServer, () => {
          console.log('sent to port');
          resolve();
        });
      });
    })
  )
    .then(() => {
      console.log('closing socket');
      sock.close();
    })
    .catch(err => console.log('error with promise', err));
});
