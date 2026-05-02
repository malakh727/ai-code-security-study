// Here's a Node.js script that demonstrates parsing a custom packet with a dynamic length field using the binary-parser library:

// javascript
const { Parser } = require('binary-parser');

// Example packet structure:
// - Packet type (1 byte) - determines the structure of the rest
// - Message ID (2 bytes)
// - Data length (2 bytes) - tells us how many bytes of data follow
// - Data (variable length, based on data length field)
// - Checksum (1 byte) - XOR of all previous bytes

class PacketParser {
  constructor() {
    // Base parser for the fixed header part
    this.headerParser = new Parser()
      .uint8('packetType')
      .uint16le('messageId')
      .uint16le('dataLength');
  }

  // Create a dynamic parser based on packet type and data length
  createDynamicParser(packetType, dataLength) {
    let parser = new Parser()
      .uint8('packetType')
      .uint16le('messageId')
      .uint16le('dataLength');

    // Add dynamic field based on packet type
    switch (packetType) {
      case 0x01: // Text message
        parser = parser.string('data', {
          length: dataLength,
          encoding: 'utf8'
        });
        break;
        
      case 0x02: // Binary data
        parser = parser.buffer('data', {
          length: dataLength
        });
        break;
        
      case 0x03: // Structured data with multiple fields
        // For structured data, we need to parse the inner fields
        parser = parser.nest('data', {
          type: new Parser()
            .uint8('subType')
            .uint16le('value1')
            .uint32le('value2')
            .string('description', {
              length: dataLength - 7, // Subtract the bytes we've already parsed (1 + 2 + 4 = 7)
              encoding: 'utf8'
            })
        });
        break;
        
      default:
        parser = parser.buffer('data', {
          length: dataLength
        });
    }

    // Add checksum at the end
    return parser.uint8('checksum');
  }

  parsePacket(buffer) {
    try {
      // First, parse just the header to get the data length and packet type
      const header = this.headerParser.parse(buffer.slice(0, 5)); // 1 + 2 + 2 = 5 bytes
      
      // Create a dynamic parser based on the packet type and data length
      const fullParser = this.createDynamicParser(header.packetType, header.dataLength);
      
      // Parse the entire packet
      const totalLength = 5 + header.dataLength + 1; // header + data + checksum
      const packet = fullParser.parse(buffer.slice(0, totalLength));
      
      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(buffer.slice(0, totalLength - 1));
      if (calculatedChecksum !== packet.checksum) {
        throw new Error(`Checksum mismatch: expected ${calculatedChecksum}, got ${packet.checksum}`);
      }
      
      return packet;
    } catch (error) {
      throw new Error(`Failed to parse packet: ${error.message}`);
    }
  }

  calculateChecksum(buffer) {
    return buffer.reduce((acc, byte) => acc ^ byte, 0);
  }

  // Helper method to create test packets
  createTestPacket(type, messageId, data) {
    let dataBuffer;
    let dataLength;
    
    switch (type) {
      case 0x01: // Text
        dataBuffer = Buffer.from(data, 'utf8');
        dataLength = dataBuffer.length;
        break;
        
      case 0x02: // Binary
        dataBuffer = Buffer.from(data);
        dataLength = dataBuffer.length;
        break;
        
      case 0x03: // Structured
        const subType = data.subType || 0;
        const value1 = data.value1 || 0;
        const value2 = data.value2 || 0;
        const description = data.description || '';
        
        const descBuffer = Buffer.from(description, 'utf8');
        dataBuffer = Buffer.alloc(1 + 2 + 4 + descBuffer.length);
        dataBuffer.writeUInt8(subType, 0);
        dataBuffer.writeUInt16LE(value1, 1);
        dataBuffer.writeUInt32LE(value2, 3);
        descBuffer.copy(dataBuffer, 7);
        dataLength = dataBuffer.length;
        break;
        
      default:
        dataBuffer = Buffer.from([]);
        dataLength = 0;
    }
    
    // Create packet: [type][msgId][dataLength][data][checksum]
    const packet = Buffer.alloc(5 + dataLength + 1);
    packet.writeUInt8(type, 0);
    packet.writeUInt16LE(messageId, 1);
    packet.writeUInt16LE(dataLength, 3);
    
    if (dataBuffer.length > 0) {
      dataBuffer.copy(packet, 5);
    }
    
    // Calculate and write checksum
    const checksum = this.calculateChecksum(packet.slice(0, 5 + dataLength));
    packet.writeUInt8(checksum, 5 + dataLength);
    
    return packet;
  }
}

// Example usage
async function main() {
  const parser = new PacketParser();
  
  console.log('=== Dynamic Packet Parser Example ===\n');
  
  // Example 1: Text message
  const textPacket = parser.createTestPacket(
    0x01, 
    1001, 
    'Hello, this is a test message!'
  );
  
  console.log('Parsing text packet:');
  console.log('Raw packet (hex):', textPacket.toString('hex'));
  const parsedText = parser.parsePacket(textPacket);
  console.log('Parsed result:', JSON.stringify(parsedText, null, 2));
  console.log();
  
  // Example 2: Binary data
  const binaryPacket = parser.createTestPacket(
    0x02,
    1002,
    Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05])
  );
  
  console.log('Parsing binary packet:');
  console.log('Raw packet (hex):', binaryPacket.toString('hex'));
  const parsedBinary = parser.parsePacket(binaryPacket);
  console.log('Parsed result:', {
    ...parsedBinary,
    data: Array.from(parsedBinary.data) // Convert buffer to array for display
  });
  console.log();
  
  // Example 3: Structured data
  const structuredPacket = parser.createTestPacket(
    0x03,
    1003,
    {
      subType: 0x0A,
      value1: 12345,
      value2: 987654321,
      description: 'Nested data example'
    }
  );
  
  console.log('Parsing structured packet:');
  console.log('Raw packet (hex):', structuredPacket.toString('hex'));
  const parsedStructured = parser.parsePacket(structuredPacket);
  console.log('Parsed result:', JSON.stringify(parsedStructured, null, 2));
  console.log();
  
  // Example 4: Error handling - corrupted packet
  try {
    const corruptedPacket = Buffer.from(textPacket);
    corruptedPacket[corruptedPacket.length - 1] = 0x00; // Corrupt checksum
    
    console.log('Attempting to parse corrupted packet:');
    parser.parsePacket(corruptedPacket);
  } catch (error) {
    console.log('Error caught:', error.message);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PacketParser };
// This script demonstrates:

// Two-stage parsing: First parses the fixed header to get the dynamic length information, then creates a complete parser based on that information.

// Dynamic field handling: The createDynamicParser() method builds different parsers based on the packet type and data length.

// Multiple data types: Handles different packet types:

// Text messages (UTF-8 strings)

// Binary data (raw buffers)

// Structured data with nested fields

// Checksum verification: Includes data integrity checking

// Error handling: Gracefully handles malformed packets and checksum mismatches

// To use this script:

// Install the dependency:

// bash
// npm install binary-parser
// Run the example:

// bash
// node packet-parser.js
// The script will parse several example packets and show the results, demonstrating how the parser dynamically adjusts to different packet structures based on the header fields.