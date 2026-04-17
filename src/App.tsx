import React from 'react';

const leverDigits = 10;
const dialLDigits = 11;
const dialRDigits = 21;

export function App() {
  const [leverValues, setLeverValues] = React.useState(Array(leverDigits).fill(0));
  const [dialLValues, setDialLValues] = React.useState(Array(dialLDigits).fill(0));
  const [dialRValues, setDialRValues] = React.useState(Array(dialRDigits).fill(0));
  const [renjou, setRenjou] = React.useState(false);
  const [clutch, setClutch] = React.useState(0);
  return (
    <div className="app">
      <button onClick={() => crank(false)}>+</button>
      <button onClick={() => crank(true)}>-</button>
      <button onClick={() => setLeverValues(Array(leverDigits).fill(0))}>レバークリヤー</button>
      {
        leverValues.map(
          (value, index) => <Lever key={index} value={value} setValue={
            (newValue) => {
              setRenjou(false);
              setDigit(leverValues, setLeverValues, index, newValue);
            }
          } />
        )
      }
      <button onClick={
        () => {
          setDialRValues(Array(dialRDigits).fill(0));
          if (renjou) {
            setLeverValues(dialRValues.slice(0, leverDigits));
            setRenjou(false);
          }
        }
      }>右帰零</button>
      {
        dialRValues.map(
          (value, index) => <div className="dialR" key={index}>{value}</div>
        )
      }
      <div>{(() => {
        switch (clutch) {
          case 0: return "N";
          case 1: return "×";
          case -1: return "÷";
        }
      })()}</div>
      {
        dialLValues.map(
          (value, index) => <div className="dialL" key={index}>{value}</div>
        )
      }
      <button onClick={
        () => {
          setClutch(0);
          setDialLValues(Array(dialLDigits).fill(0));
        }
      }>左帰零</button>
      <label>
        連乗
        <input type="checkbox" disabled={leverValues.some(v => v !== 0)} checked={renjou} onChange={(e) => { setRenjou(e.target.checked) }} />
      </label>
    </div>
  );
  function setDigit(values: number[], setValues: React.Dispatch<React.SetStateAction<number[]>>, digit: number, newValue: number) {
    const newValues = [...values];
    newValues[digit] = newValue;
    setValues(newValues);
  }
  function addValue(a: number[], b: number[], sub: boolean = false, maxDigits: number = Math.max(a.length, b.length)) {
    const sign = sub ? -1 : 1;
    let sum = [...a];
    let carry = 0;
    for (let i = 0; i < maxDigits; i++) {
      const digit = (a[i] || 0) + sign * (b[i] || 0) + carry;
      sum[i] = (digit + 10) % 10;
      carry = Math.floor(digit / 10);
    }
    return { sum, carry };
  }

  function crank(sub: boolean = false) {
    const { sum, carry } = addValue(dialRValues, leverValues, sub, 13); // TODO: maxDigitsは桁送りしたら変わる
    setDialRValues(sum.slice(0, dialRDigits));
    console.log('Carry:', carry);

    const sign = sub ? -1 : 1;
    if (clutch === 0) {
      setClutch(sign);
      setDialLValues(addValue(dialLValues, [1]).sum);
    } else {
      setDialLValues(addValue(dialLValues, [sign * clutch]).sum);
    }
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
