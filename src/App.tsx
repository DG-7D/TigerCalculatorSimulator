import React from 'react';

const leverDigits = 10;

export function App() {
  const [leverValues, setLeverValues] = React.useState(Array(leverDigits).fill(0));
  return (
    <div className="app">
      {
        leverValues.map(
          (value, index) => <Lever key={index} value={value} setValue={
            (newValue) => {
              setDigit(leverValues, setLeverValues, index, newValue);
            }
          } />
        )
      }
    </div>
  );
  function setDigit(values: number[], setValues: React.Dispatch<React.SetStateAction<number[]>>, digit: number, newValue: number) {
    const newValues = [...values];
    newValues[digit] = newValue;
    setValues(newValues);
  }
}

function Lever({ value, setValue }: { value: number, setValue: (newValue: number) => void }) {
  return (
    <div className="lever">
      <button onClick={() => value === 0 || setValue(value - 1)}>-</button>
      <button onClick={() => value === 9 || setValue(value + 1)}>+</button>
      <input type="number" min={0} max={9} value={value} onChange={(e) => setValue(parseInt(e.target.value))} />
      <input type="range" min={0} max={9} value={value} onChange={(e) => setValue(parseInt(e.target.value))} />
    </div>
  );
}


export default App;
