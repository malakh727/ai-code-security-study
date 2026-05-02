// Parsing dynamic packets with binary-parser is a bit like building Lego sets where the instructions change halfway through. To handle fields that depend on previous values, we use the .choice() or .if() methods, and for dynamic lengths, we leverage the length property which can accept a callback function.

// The Scenario
// Let's build a parser for a hypothetical "Data Packet" structured like this:

// Type (uint8): Determines the data format (1 for String, 2 for Integers).

// Count (uint8): The number of elements to follow.

// Payload: * If Type is 1: A string of length Count.

// If Type is 2: An array of uint16 integers with Count elements.

// The Node.js Implementation
// First, ensure you have the library installed: npm install binary-parser

// JavaScript
const { Parser } = require('binary-parser');

// 1. Define the dynamic parser
const packetParser = new Parser()
  .uint8('type')   // 1 = String, 2 = Integer Array
  .uint8('count')  // The dynamic multiplier
  .choice('payload', {
    tag: 'type',
    choices: {
      // If type is 1, parse a string of length 'count'
      1: new Parser().string('data', {
        length: 'count',
        encoding: 'utf8'
      }),
      // If type is 2, parse 'count' number of uint16 integers
      2: new Parser().array('data', {
        type: 'uint16be',
        length: 'count'
      })
    }
  });

// // 2. Test Data
// // Example A: Type 1 (String), Count 5, Data "Hello"
// const bufA = Buffer.from([0x01, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);

// // Example B: Type 2 (Array), Count 3, Data [258, 515, 772]
// // (258 = 0x0102, 515 = 0x0203, 772 = 0x0304)
// const bufB = Buffer.from([0x02, 0x03, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04]);

// // 3. Execution
// console.log('Result A:', packetParser.parse(bufA));
// console.log('Result B:', packetParser.parse(bufB));
// Key Logic Breakdown
// Contextual Access: Inside the choices or length properties, the library automatically looks at the previously parsed fields. By passing the string 'count' to the length property, you are telling the parser: "Go look at the value we just stored in the count variable."

// The .choice() Method: This is the cleanest way to handle branching logic. It acts like a switch statement for your binary data.

// Endianness: Note the use of uint16be (Big Endian). When dealing with multi-byte integers, always ensure your parser matches the sender's byte order.

// Why this approach?
// Without the choice method, you'd have to parse the header, stop, check the value in JavaScript, and then manually calculate offsets to parse the rest. This declarative style keeps your schema in one readable block.

// Would you like me to show you how to wrap this into a Transform Stream for handling a continuous flow of TCP packets?