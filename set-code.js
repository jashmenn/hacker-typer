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

var client = new net.Socket();
client.connect(argv.port, argv.host, function() {
  let filename = argv._[0];
  console.log("Connected.");
  console.log(`Sending ${filename}`);
  let thisCode = fs.readFileSync(filename).toString();
  client.write(thisCode);
});

client.on("data", function(data) {
  console.log("Received: " + data);
  client.destroy(); // kill client after server's response
});

client.on("close", function() {
  console.log("Connection closed");
});
