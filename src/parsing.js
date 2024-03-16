const TAPParser = require('./tap-parser');

const parser = new TAPParser('res');

parser.on('test', (test) => {
  console.log(`${test.type} ${test.number} ${test.description}`);
});

parser.on('end', () => {
  console.log(`Total tests: ${parser.testCount}`);
  console.log(`Passed: ${parser.testPassed}`);
  console.log(`Failed: ${parser.testFailed}`);
  console.log(`Skipped: ${parser.testSkipped}`);
});

parser.parse();