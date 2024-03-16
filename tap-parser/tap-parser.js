const EventEmitter = require('events');
const lineReader = require('line-reader');
const yaml = require('js-yaml');

class TAPParser extends EventEmitter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.testCount = 0;
    this.testPassed = 0;
    this.testFailed = 0;
    this.testSkipped = 0;
    this.currentTest = null;
    this.planDefined = false;
    this.planCount = 0;
    this.yaml = '';
  }

  parse() {
    lineReader.eachLine(this.filePath, (line, last) => {
      if (line.startsWith('TAP version 13')) {
        this.emit('version', 13);
      } else if (line.startsWith('1..')) {
        this.handlePlan(line);
      } else if (line.startsWith('Bail out!')) {
        this.emit('bailout', line.replace('Bail out!', '').trim());
        this.emit('end');
      } else if (line.startsWith('ok') || line.startsWith('not ok')) {
        const parsedLine = this.parseTestLine(line);
        if (parsedLine) {
          this.processLine(parsedLine);
          this.emit('test', parsedLine);
        }
      } else if (line.startsWith('#')) {
        this.emit('diagnostic', line.substring(1).trim());
      } else if (line.startsWith('  ---')) {
        this.yaml += line.substring(2) + '\n';
      } else if (line.startsWith('  ...')) {
        this.parseYaml(this.yaml);
        this.yaml = '';
      }

      if (last) {
        if (!this.planDefined) {
          this.handlePlan(`1..${this.testCount}`);
        }
        this.emit('end');
      }
    });
  }

  handlePlan(line) {
    const [, planCount] = line.split('1..');
    this.planCount = parseInt(planCount, 10);
    this.planDefined = true;
    this.emit('plan', this.planCount);
  }

  parseTestLine(line) {
    const tapRegex = /^(not )?ok\s*(?:#\s*(\d+))?\s*(.*?)\s*(#\s*(TODO|SKIP)\s*(.*))?$/;
    const match = line.match(tapRegex);
    if (match) {
      return {
        type: match[1] ? 'not ok' : 'ok',
        number: match[2] ? parseInt(match[2], 10) : null,
        description: match[3],
        directive: match[5] ? match[5].toLowerCase() : null,
        directiveReason: match[6] || null,
      };
    }
    return null;
  }

  processLine(parsedLine) {
    switch (parsedLine.type) {
      case 'ok':
        this.testPassed++;
        this.currentTest = parsedLine;
        if (parsedLine.directive === 'todo') {
          this.emit('todo', parsedLine);
        }
        break;
      case 'not ok':
        this.testFailed++;
        this.currentTest = parsedLine;
        if (parsedLine.directive === 'skip') {
          this.testSkipped++;
        }
        break;
      default:
        break;
    }
    this.testCount++;
  }

  parseYaml(yamlString) {
    try {
      const yamlData = yaml.load(yamlString);
      if (this.currentTest) {
        this.currentTest.yaml = yamlData;
        this.emit('yaml', yamlData);
      }
    } catch (error) {
      this.emit('error', `Error parsing YAML: ${error.message}`);
    }
  }
}

module.exports = TAPParser;