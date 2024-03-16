import React, { useState } from 'react';
import TestResultsTable from './components/TestResultsTable';

function App() {
  const [testResults, setTestResults] = useState([]);

  const parseTAPFile = (file) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const lines = fileReader.result.split('\n');
      const parsedTestResults = [];

      for (const line of lines) {
        if (line.startsWith('ok') || line.startsWith('not ok')) {
          const parsedLine = parseTestLine(line);
          if (parsedLine) {
            parsedTestResults.push(parsedLine);
          }
        }
      }

      setTestResults(parsedTestResults);
    };

    fileReader.readAsText(file);
  };

  const parseTestLine = (line) => {
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
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    parseTAPFile(file);
  };

  return (
    <div>
      <h1>TAP Test Results</h1>
      <input type="file" onChange={handleFileUpload} />
      <TestResultsTable testResults={testResults} />
    </div>
  );
}

export default App;