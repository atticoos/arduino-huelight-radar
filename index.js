var App = require('./lib/app.js'),
    argv = require('yargs').argv,
    serialPort = require('serialport'),
    util = require('util'),
    REGEX = /[^0-9.]/g,
    app;

if (argv.port) {
  app = new App(argv.port);
  app.start();
} else {
  serialPort.list(function (err, ports) {
    process.stdout.write('Please select a port\n');
    ports.forEach(function (port, i) {
      process.stdout.write((i+1) + ') ' + port.comName + '\n');
    });
    process.stdout.write('Selected Port: ');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', function (data) {
      data = parseInt(util.inspect(data).replace(REGEX, ''));
      if (isNaN(data) || data > ports.length || data < 1) {
        throw new Error('Invalid selection');
      } else {
        app = new App(ports[data-1].comName);
        app.start();
      }
    });
  });
}
