import React from 'react';
import { LineChart, LineSeries, XAxis, YAxis, Tooltip } from 'react-charts';

const TestResultsTable = ({ testResults }) => {
  // Extract benchmark data from testResults
  const benchmarkData = testResults
    .filter((test) => test.description.includes('Benchmark'))
    .map((test) => {
      const [, benchmarkName, value] = test.description.match(/ Benchmark (\w+): (\d+)/);
      return { benchmarkName, value: parseFloat(value) };
    });

  console.log('Test Results:', testResults); // Debugging
  console.log('Benchmark Data:', benchmarkData); // Debugging

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Test Number</th>
            <th>Result</th>
            <th>Description</th>
            <th>Directive</th>
          </tr>
        </thead>
        <tbody>
          {testResults.map((test, index) => (
            <tr key={index}>
              <td>{test.number}</td>
              <td>{test.type === 'ok' ? '✅' : '❌'}</td>
              <td>{test.description}</td>
              <td>{test.directive || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {benchmarkData.length > 0 && (
        <div>
          <h2>Benchmark Results</h2>
          <LineChart
            data={benchmarkData}
            primaryKey="benchmarkName"
            primaryCursor="pointer"
            style={{ width: '100%', height: '300px' }} // Set dimensions as needed
          >
            <XAxis primary={true} />
            <YAxis primary={true} />
            <LineSeries primaryKey="value" showPoints={true} />
            <Tooltip
              render={({ datum }) => (
                <div>
                  <strong>{datum.originalDatum.benchmarkName}</strong>
                  <br />
                  Value: {datum.originalDatum.value}
                </div>
              )}
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default TestResultsTable;
