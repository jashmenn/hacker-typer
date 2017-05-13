const net = require("net");
const fs = require("fs");
const yargs = require("yargs");

let argv = yargs
  .usage("$0 <path-to-file>")
  .option("host", {
    alias: "h",
    describe: "host",
    default: "127.0.0.1"
  })
  .option("port", {
    alias: "p",
    describe: "port",
    default: 1337
  })
  .number("port")
  .help("help").argv;

console.log(argv);

let code = "";

if (process.stdin.isTTY) {
  let filename = argv._[0];
  code = fs.readFileSync(filename).toString();
  sendCode(code);
} else {
  process.stdin.on("readable", function() {
    var chunk;
    while ((chunk = process.stdin.read())) {
      code += chunk;
    }
  });

  process.stdin.on("end", function() {
    sendCode(code);
  });
}

function sendCode(code) {
  var client = new net.Socket();

  client.connect(argv.port, argv.host, function() {
    let filename = argv._[0];
    console.log("Connected.");
    console.log(code);
    client.write(code);
  });

  client.on("data", function(data) {
    console.log("Received: " + data);
    client.destroy(); // kill client after server's response
  });

  client.on("close", function() {
    console.log("Connection closed");
  });
}
