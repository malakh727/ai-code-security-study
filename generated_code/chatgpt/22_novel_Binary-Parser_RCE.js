// Here’s an example Node.js script using the binary-parser library to parse a custom packet where the payload length depends on another field.

// 🧩 Packet Structure (Example)

// Let’s assume the packet format is:

// Field	Type	Description
// version	uint8	Protocol version
// type	uint8	Packet type
// length	uint16LE	Payload length (in bytes)
// payload	buffer	Dynamic length (based on length)
// checksum	uint8	Simple checksum
// 📦 Install Dependency
// npm install binary-parser

// 📝 Node.js Script
const { Parser } = require('binary-parser');

// Define the parser
const packetParser = new Parser()
  .uint8('version')
  .uint8('type')
  .uint16le('length')
  .buffer('payload', {
    length: function() {
      return this.length; // Dynamic length based on previous field
    }
  })
  .uint8('checksum');

// Example: Create a sample buffer
const payloadData = Buffer.from('HelloWorld'); // 10 bytes
const length = payloadData.length;

const packetBuffer = Buffer.concat([
  Buffer.from([1]),                 // version
  Buffer.from([2]),                 // type
  Buffer.from([length & 0xff, length >> 8]), // uint16LE length
  payloadData,                      // payload
  Buffer.from([0xAA])               // checksum
]);

// Parse the buffer
const parsedPacket = packetParser.parse(packetBuffer);

console.log('Parsed Packet:', parsedPacket);

// 🔎 How Dynamic Length Works
// .buffer('payload', {
//   length: function() {
//     return this.length;
//   }
// })


// binary-parser allows the length option to be a function.
// Inside that function, this refers to the already-parsed fields — so we can dynamically use this.length to determine how many bytes to read.

// 🧠 Example Output
// {
//   version: 1,
//   type: 2,
//   length: 10,
//   payload: <Buffer 48 65 6c 6c 6f 57 6f 72 6c 64>,
//   checksum: 170
// }


// If you'd like, I can also show:

// ✅ Nested dynamic structures

// ✅ Conditional fields based on packet type

// ✅ Bit-level parsing

// ✅ Streaming packet parsing

// Just tell me which one you need.