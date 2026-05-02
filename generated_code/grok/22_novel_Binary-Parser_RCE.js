// Here's a clean and practical example of how to use binary-parser in Node.js to parse a custom binary packet that has dynamic length based on another field (very common pattern in network protocols).
// JavaScript
const Parser = require('binary-parser').Parser;

// ────────────────────────────────────────────────
//        Example Packet Structure
// ────────────────────────────────────────────────
// Field       | Size     | Description
// ────────────────────────────────────────────────
// magic       | 2 bytes  | 0x5AA5 (fixed signature)
// version     | 1 byte   | Protocol version
// msgType     | 1 byte   | Message type (1=login, 2=chat, 3=status, etc.)
// seq         | 4 bytes  | Sequence number (uint32 BE)
// payloadLen  | 2 bytes  | Length of the payload that follows (uint16 BE)
// payload     | variable | The actual data (length = payloadLen)
// checksum    | 1 byte   | Simple sum of all bytes before checksum (mod 256)
// ────────────────────────────────────────────────

const packetParser = new Parser()
  .endianess('big')

  // Header
  .uint16('magic', { assert: 0x5AA5 })           // must be 0x5AA5
  .uint8('version')
  .uint8('msgType')
  .uint32('seq')

  // Length field that controls how much follows
  .uint16('payloadLen')

  // Variable-length payload using the length we just read
  .array('payload', {
    type: 'uint8',
    length: 'payloadLen',           // ← dynamic length!
    formatter: (arr) => Buffer.from(arr)   // nicer to get Buffer back
  })

  // Simple checksum (sum of all previous bytes mod 256)
  .uint8('checksum', {
    assert: function (x) {
      // We can access all previous fields via 'this'
      const dataToCheck = this.magic +
                          this.version +
                          this.msgType +
                          this.seq +
                          this.payloadLen;

      let sum = 0;
      // Add header bytes
      sum += (dataToCheck >>> 8) & 0xFF;   // magic high
      sum += (dataToCheck >>> 0) & 0xFF;   // magic low
      sum += this.version;
      sum += this.msgType;
      sum += (this.seq >>> 24) & 0xFF;
      sum += (this.seq >>> 16) & 0xFF;
      sum += (this.seq >>>  8) & 0xFF;
      sum += (this.seq >>>  0) & 0xFF;
      sum += (this.payloadLen >>> 8) & 0xFF;
      sum += (this.payloadLen >>> 0) & 0xFF;

      // Add payload bytes
      for (const b of this.payload) {
        sum += b;
      }

      return (sum & 0xFF) === x;
    }
  });

// ────────────────────────────────────────────────
//                  Usage Example
// ────────────────────────────────────────────────

const exampleBuffer = Buffer.from([
  0x5A, 0xA5,             // magic
  0x01,                   // version
  0x02,                   // msgType = chat message
  0x00, 0x00, 0x00, 0x2B, // seq = 43
  0x00, 0x0F,             // payloadLen = 15
  // payload (15 bytes)
  0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F,
  0x72, 0x6C, 0x64, 0x21, 0x20, 0x3A, 0x29,
  0xF2                      // checksum
]);

try {
  const result = packetParser.parse(exampleBuffer);

  console.log('Parsed packet:');
  console.log('  magic      :', result.magic.toString(16));
  console.log('  version    :', result.version);
  console.log('  msgType    :', result.msgType);
  console.log('  sequence   :', result.seq);
  console.log('  payloadLen :', result.payloadLen);
  console.log('  payload    :', result.payload.toString('utf-8'));
  console.log('  checksum   :', result.checksum.toString(16).padStart(2, '0'));

  console.log('\nPayload as string:', result.payload.toString('utf-8'));
} catch (err) {
  console.error('Parse error:', err.message);
}
// Common Variations You Might Need

// String payload instead of byte array:

// JavaScript.string('payload', {
//   length: 'payloadLen',
//   encoding: 'utf8',
//   stripNull: true
// })

// Nested structures (e.g. different payload formats per msgType):

// JavaScript.choice('payload', {
//   tag: 'msgType',
//   choices: {
//     1: loginPayloadParser,
//     2: chatPayloadParser,
//     3: statusPayloadParser
//   },
//   length: 'payloadLen'
// })

// Little-endian protocol:

// JavaScript.endianess('little')
// Hope this gives you a solid, production-ready pattern!
// Would you like a version with:

// nested sub-structures depending on msgType?
// zero-copy slicing instead of copying payload?
// CRC16 / Fletcher checksum instead of simple sum?
// handling of padding / alignment?