import React from 'react';

const leverDigits = 10;
const dialRDigits = 20;
const clankDigits = leverDigits + 3;
const dialLDigits = 11;
const digitShiftMax = Math.min(dialLDigits - 1, dialRDigits - leverDigits);
const gridColumns = 1 + dialLDigits + dialRDigits + digitShiftMax;

export function App() {
  const [leverValues, setLeverValues] = React.useState(Array(leverDigits).fill(0));
  const [dialLValues, setDialLValues] = React.useState(Array(dialLDigits).fill(0));
  const [dialRValues, setDialRValues] = React.useState(Array(dialRDigits).fill(0));
  const [renjou, setRenjou] = React.useState(false);
  const [clutch, setClutch] = React.useState(0);
  const [digitShift, setDigitShift] = React.useState(0);
  return (
    <div className="app">
      <div style={{
        display: "grid",
        gridTemplateColumns: ` 1fr repeat(${gridColumns}, 1fr) 1fr`,
        // gridTemplateRows: `repeat(2, 1fr)`,
      }}>
        {
          leverValues.map(
            (value, index) => <Lever key={index} value={value} setValue={
              (newValue) => {
                setRenjou(false);
                setDigit(leverValues, setLeverValues, index, newValue);
              }
            } style={{
              gridColumn: 1 + dialLDigits + 1 + dialRDigits - index,
              gridRow: 1,
            }} />
          ).reverse()
        }
        <div style={{
          gridColumn: 1 + dialLDigits + 1 + dialRDigits + 1,
          gridRow: 1,
        }}>
          <button onClick={() => crank(false)}>+</button><br />
          <button onClick={() => crank(true)}>-</button><br />
          <button onClick={() => setLeverValues(Array(leverDigits).fill(0))}>レバークリヤー</button>
        </div>
        {
          dialRValues.map(
            (value, index) => <div className="dialR" key={index} style={{
              gridColumn: 1 + dialLDigits + 1 + dialRDigits + digitShift - index,
              gridRow: 2,
            }}>{value}</div>
          ).reverse()
        }
        <button onClick={
          () => {
            setDialRValues(Array(dialRDigits).fill(0));
            if (renjou) {
              setLeverValues(dialRValues.slice(0, leverDigits));
              setRenjou(false);
            }
          }
        } style={{
          gridColumn: 1 + dialLDigits + 1 + dialRDigits + digitShift + 1,
          gridRow: 2,
        }}>右帰零</button>
        {
          dialLValues.map(
            (value, index) => <div className="dialL" key={index} style={{
              gridColumn: 1 + dialLDigits + digitShift - index,
              gridRow: 2,
            }}>{value}</div>
          ).reverse()
        }
        <button onClick={
          () => {
            setClutch(0);
            setDialLValues(Array(dialLDigits).fill(0));
          }
        } style={{
          gridColumn: 1 + digitShift,
          gridRow: 2,
        }}>左帰零</button>
        <div style={{
          gridColumnStart: 1 + dialLDigits - 1,
          gridColumnEnd: 1 + dialLDigits + 2,
          gridRow: 1,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "1fr auto auto auto",
        }}
        >
          <div style={{ gridColumn: 1, gridRow: 2 }}>×</div>
          <div style={{ gridColumn: 3, gridRow: 2 }}>÷</div>
          <div style={{ gridColumn: "1 / 4", gridRow: 3 }}>
            <input type="range" min={-1} max={1} value={clutch} onChange={(e) => setClutch(parseInt(e.target.value))} style={{
              width: "100%",
              direction: "rtl",
            }} />
          </div>
          <div style={{ gridColumn: 2, gridRow: 4, textAlign: "center" }}>▽</div>
        </div>
      </div>
      <label>
        連乗
        <input type="checkbox" disabled={leverValues.some(v => v !== 0)} checked={renjou} onChange={(e) => { setRenjou(e.target.checked) }} />
      </label>
      <button onClick={() => shiftDigit(0)}>&lt;&lt;</button>
      <button onClick={() => shiftDigit(digitShift - 1)}>&lt;</button>
      <button onClick={() => shiftDigit(digitShift + 1)}>&gt;</button>
      <button onClick={() => shiftDigit(digitShiftMax)}>&gt;&gt;</button>
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
    const toAdd = dialRValues.slice(digitShift, digitShift + clankDigits);
    const { sum, carry } = addValue(toAdd, leverValues, sub);
    setDialRValues(dialRValues.toSpliced(digitShift, sum.length, ...sum));
    if (carry !== 0) {
      console.log("🔔");
    }

    const sign = sub ? -1 : 1;
    if (clutch === 0) {
      setClutch(sign);
      setDialLValues(addValue(dialLValues, [10 ** digitShift]).sum);
    } else {
      setDialLValues(addValue(dialLValues, [sign * clutch * 10 ** digitShift]).sum);
    }
  }

  function shiftDigit(shift: number) {
    setDigitShift(Math.max(0, Math.min(digitShiftMax, shift)));
  }
}

function Lever({ value, setValue, style }: { value: number, setValue: (newValue: number) => void, style?: React.CSSProperties }) {
  return (
    <div className="lever" style={style}>
      <button onClick={() => value === 0 || setValue(value - 1)} style={{ display: "block" }}>-</button>
      <button onClick={() => value === 9 || setValue(value + 1)} style={{ display: "block" }}>+</button>
      <input type="number" min={0} max={9} value={value} onChange={(e) => setValue(parseInt(e.target.value))} style={{ display: "block" }} />
      <input type="range" min={0} max={9} value={value} onChange={(e) => setValue(parseInt(e.target.value))} style={{
        display: "block",
        writingMode: "vertical-rl",
      }} />
    </div>
  );
}


export default App;
