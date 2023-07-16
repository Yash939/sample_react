import React, { useEffect, useMemo, useRef } from 'react';

const TimePickerCellRenderer = ({ editorProps, value, format = "hh:mm:ss", ampm = false }) => {
    const hhRef = useRef();
    const mmRef = useRef();
    const ssRef = useRef();
    const ampmRef = useRef();

    const rangeOfOptions = (to = 0) => {
        let options = []
        for (let index = 0; index <= to; index++) {
            const val = (index < 10 ? "0" : "") + index
            options.push(<option key={val} value={val}>{val}</option>)
        }
        return options;
    }

    const getValues = () => {
        const hh = hhRef?.current && ampm && (ampmRef.current.value === "pm") ? (parseInt(hhRef.current.value) + 12) : (hhRef.current.value)
        const mm = mmRef?.current ? mmRef.current.value : "00"
        const ss = ssRef?.current ? ssRef.current.value : "00"
        return format.replace("hh", hh).replace("mm", mm).replace("ss", ss);
    }

    const hhValue = useMemo(() => {
        const a = value ? parseInt(value.split(":")[0]) > 12 ? parseInt(value.split(":")[0]) - 12 : value.split(":")[0] : "00"
        return (parseInt(a) < 10 ? "0" : "") + parseInt(a)
    }, [value])
    const mmValue = useMemo(() => {
        return value ? value.split(":")[1] : "00"
    }, [value])
    const ssValue = useMemo(() => {
        return value ? value.split(":")[2] : "00"
    }, [value])
    const ampmValue = useMemo(() => {
        const a = value && parseInt(value.split(":")[0]) >= 12 ? 'pm' : 'am'
        return a
    }, [value])

    return (
        <div style={editorProps.styles}>
            {format.includes("hh") && (
                <select ref={hhRef} key="hh" className="select-no-arrow" value={hhValue} onChange={() => editorProps.onUpdate(getValues())}>
                    <option disabled key="hh" value="hh">HH</option>
                    {rangeOfOptions(ampm ? 12 : 23)}
                </select>
            )}

            {format.includes("mm") && (
                <>
                    :
                    <select ref={mmRef} key="mm" className="select-no-arrow" value={mmValue} onChange={() => editorProps.onUpdate(getValues())}>
                        <option disabled key="mm" value="mm">MM</option>
                        {rangeOfOptions(59)}
                    </select>
                </>
            )}
            {ampm && (
                <>
                    :
                    <select ref={ampmRef} key="ampm" className="select-no-arrow" value={ampmValue} onChange={() => editorProps.onUpdate(getValues())}>
                        <option key="am" value="am">AM</option>
                        <option key="pm" value="pm">PM</option>
                    </select>
                </>
            )}
            {format.includes("ss") && !ampm && (
                <>
                    :
                    <select ref={ssRef} key="ss" className="select-no-arrow" value={ssValue} onChange={() => editorProps.onUpdate(getValues())}>
                        <option disabled key="ss" value="ss">SS</option>
                        {rangeOfOptions(59)}
                    </select>
                </>
            )}
        </div>
    );
};

export default TimePickerCellRenderer;