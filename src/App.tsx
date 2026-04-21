import React from 'react';

const leverDigits = 10;
const dialRDigits = 20;
const clankDigits = leverDigits + 3;
const dialLDigits = 11;
const digitShiftMax = Math.min(dialLDigits - 1, dialRDigits - leverDigits);

export function App() {
  const [leverValues, setLeverValues] = React.useState(Array(leverDigits).fill(0));
  const [dialLValues, setDialLValues] = React.useState(Array(dialLDigits).fill(0));
  const [dialRValues, setDialRValues] = React.useState(Array(dialRDigits).fill(0));
  const [renjou, setRenjou] = React.useState(false);
  const [renjouHold, setRenjouHold] = React.useState(false);
  const [clutch, setClutch] = React.useState(0);
  const [digitShift, setDigitShift] = React.useState(0);
  const onKeydown = React.useEffectEvent((e: KeyboardEvent) => {
    // console.log(e);
    switch (e.key) {
      case "Enter":
        crank(false);
        break;
      case "Backspace":
        crank(true);
        break;
      case "Shift":
        if (e.code === "ShiftLeft") {
          setDialLValues(prev => Array.from(prev, _ => 0));
          setClutch(0);
        } else if (e.code === "ShiftRight") {
          setDialRValues(prev => Array.from(prev, _ => 0));
          if (renjou) {
            setLeverValues(dialRValues.slice(0 + digitShift, leverDigits + digitShift));
            !renjouHold && setRenjou(false);
          }
        }
        break;
      case "]":
        setLeverValues(prev => Array.from(prev, _ => 0));
        break;
      case "Escape":
        setDialLValues(prev => Array.from(prev, _ => 0));
        setDialRValues(prev => Array.from(prev, _ => 0));
        setClutch(0);
        setRenjou(false);
        setLeverValues(prev => Array.from(prev, _ => 0));
        setDigitShift(0);
        break;
      case ",":
        shiftDigit(digitShift - 1);
        break;
      case ".":
        shiftDigit(digitShift + 1);
        break;
      // いる???
      // case "m":
      //   shiftDigit(0);
      //   break;
      // case "/":
      //   shiftDigit(digitShiftMax);
      //   break;
      case "z":
        if (leverValues.some(v => v !== 0)) {
          break;
        }
        setRenjou(true);
        setRenjouHold(true);
        break;
    }
  });
  const onKeyup = React.useEffectEvent((e: KeyboardEvent) => {
    switch (e.key) {
      case "z":
        setRenjou(false);
        setRenjouHold(false);
        break;
    }
  });
  React.useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keyup", onKeyup);
    };
  }, []);

  const gridTemplateAreasArray = [
    [
      ...Array(1 + dialLDigits - 2).fill("."),
      ...Array(3).fill("clutch"),
      ...Array(dialRDigits - leverDigits).fill("."),
      ...Array.from({ length: leverDigits }, (_, i) => `lever${i}`).toReversed(),
      ...Array.from({ length: digitShiftMax + 1 }).fill("leverSide"),
    ],
    [
      ...Array(1 + digitShift).fill("leftSide"),
      ...Array.from({ length: dialLDigits }, (_, i) => `dialL${i}`).toReversed(),
      ".",
      ...Array.from({ length: dialRDigits }, (_, i) => `dialR${i}`).toReversed(),
      ...Array(digitShiftMax - digitShift + 1).fill("rightSide"),
    ],
  ];

  return (
    <div className="app" style={{ userSelect: "none" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `4em repeat(${dialLDigits + 1 + dialRDigits + digitShiftMax}, 1.5em) 4em`,
        gridTemplateAreas: gridTemplateAreasArray.map(row => `"${row.join(" ")}"`).join(" "),
      }}>
        {
          leverValues.map(
            (value, index) => <Lever key={index} value={value} place={index} setValue={
              (newValue) => {
                if (renjouHold) {
                  return;
                }
                setRenjou(false);
                setDigit(leverValues, setLeverValues, index, clamp(newValue, 0, 9));
              }
            } style={{ gridArea: `lever${index}` }} />
          ).reverse()
        }
        <div style={{
          gridArea: "leverSide",
          display: "grid",
          gridTemplateRows: "1fr auto"
        }}>
          <div style={{ gridRow: 2 }}>
            <button onClick={() => crank(false)}>+ 加算 (Enter)</button><br />
            <button onClick={() => crank(true)}>- 減算 (Backspace)</button><br />
            <button onClick={() => setLeverValues(Array(leverDigits).fill(0))}>レバークリヤー (])</button>
          </div>
        </div>
        {
          dialRValues.map(
            (value, index) =>
              <div className="dialR" key={index} style={{ gridArea: `dialR${index}`, textAlign: "center" }}>
                <div style={{ color: "white", background: "black", userSelect: "text" }}>{value}</div>
                <div style={{ fontSize: "0.8em" }}>{index + 1}</div>
              </div>
          ).reverse()
        }
        <div style={{ gridArea: "rightSide", textAlign: "left" }}>
          <button onClick={
            () => {
              setDialRValues(Array(dialRDigits).fill(0));
              if (renjou) {
                setLeverValues(dialRValues.slice(0 + digitShift, leverDigits + digitShift));
                !renjouHold && setRenjou(false);
              }
            }
          } style={{
          }}>右帰零<br />(LShift)</button>
        </div>
        {
          dialLValues.map(
            (value, index) => <div className="dialL" key={index} style={{ gridArea: `dialL${index}`, textAlign: "center", }}>
              <div style={{ color: "white", background: "black", userSelect: "text" }}>{value}</div>
              <div style={{ fontSize: "0.8em" }}>{index + 1}</div>
            </div>
          ).reverse()
        }
        <div style={{ gridArea: "leftSide", textAlign: "right" }}>
          <button onClick={
            () => {
              setClutch(0);
              setDialLValues(Array(dialLDigits).fill(0));
            }
          }>左帰零<br />(RShift)</button>
        </div>
        <div style={{
          gridArea: "clutch",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "1fr auto auto auto",
          textAlign: "center",
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
          <div style={{ gridColumn: 2, gridRow: 4 }}>▽</div>
        </div>
      </div>
      <label>
        連乗 (z)
        <input type="checkbox" disabled={leverValues.some(v => v !== 0) || renjouHold} checked={renjou} onChange={(e) => { setRenjou(e.target.checked) }} />
      </label>
      <button onClick={() => shiftDigit(0)}>&lt;&lt;</button>
      <button onClick={() => shiftDigit(digitShift - 1)}>&lt; (,)</button>
      桁送り
      <button onClick={() => shiftDigit(digitShift + 1)}>&gt; (.)</button>
      <button onClick={() => shiftDigit(digitShiftMax)}>&gt;&gt;</button>
    </div>
  );

  function setDigit(_: number[], setValues: React.Dispatch<React.SetStateAction<number[]>>, digit: number, newValue: number) {
    setValues(prev => prev.toSpliced(digit, 1, newValue));
  }
  function addValue(a: number[], b: number[], sub: boolean = false, maxDigits: number = Math.max(a.length, b.length)) {
    const sign = sub ? -1 : 1;
    let sum = [...a];
    let carry = 0;
    for (let i = 0; i < maxDigits; i++) {
      const digit = (a[i] || 0) + sign * (b[i] || 0) + carry;
      sum[i] = ((digit % 10) + 10) % 10;
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
      setDialLValues(addValue(dialLValues, Array.from({ length: dialLDigits }, (_, i) => i === digitShift ? 1 : 0)).sum);
    } else {
      setDialLValues(addValue(dialLValues, Array.from({ length: dialLDigits }, (_, i) => i === digitShift ? sign * clutch : 0)).sum);
    }
  }

  function shiftDigit(shift: number) {
    setDigitShift(Math.max(0, Math.min(digitShiftMax, shift)));
  }
}

function Lever({ value, setValue, place, style }: { value: number, setValue: (newValue: number) => void, place: number, style?: React.CSSProperties }) {
  const upKeys = ["0", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
  const downKeys = ["p", "o", "i", "u", "y", "t", "r", "e", "w", "q"];
  const onKeydown = React.useEffectEvent((e: KeyboardEvent) => {
    switch (e.key) {
      case upKeys[place]:
        setValue(value + 1);
        break;
      case downKeys[place]:
        setValue(value - 1);
        break;
    }
  })
  React.useEffect(() => {
    document.addEventListener("keydown", onKeydown);
  }, []);
  return (
    <div className="lever" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      textAlign: "center",
      ...style,
    }}>
      <div style={{ fontSize: "0.8em" }}>{place + 1}</div>
      <div style={{ color: "white", background: "black", userSelect: "text" }}>{value}</div>
      <input type="range" min={0} max={9} value={value} onChange={(e) => setValue(parseInt(e.target.value))} style={{
        display: "block",
        writingMode: "vertical-rl",
      }} />
      <button onClick={() => setValue(value + 1)} style={{ display: "block" }}>+</button>
      <button onClick={() => setValue(value - 1)} style={{ display: "block" }}>-</button>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default App;
