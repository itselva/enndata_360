import React, { useMemo, useState } from 'react'
import "../Styles/Table.css";

import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
let start_date = '';
export const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    start_date = start;

    return start;
};


export const getEndOfWeek = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
};

function SummaryTable() {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [timeEntries, setTimeEntries] = useState([
        "08:00", "07:30", "08:00", "08:00", "08:00", "00:00", "00:00"
    ]);
    const startOfWeek = getStartOfWeek(currentDate);
    const getWeekDays = (startOfWeek) => {
        const monday = new Date(startOfWeek);
        monday.setHours(0, 0, 0, 0);
        const week = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            week.push(day);
        }
        return week;
    };

    const weekDays = getWeekDays(startOfWeek);

    const formatDay = (date) => {
        return date.toLocaleDateString("en-GB", { weekday: "short" });
    };

    //      const getWeekDays = (startOfWeek) => {
    //     return Array.from({ length: 7 }, (_, i) => {
    //       const day = new Date(startOfWeek);
    //       day.setDate(startOfWeek.getDate() + i);
    //       return day;
    //     });
    //   };



    const isWeekValid =
        weekDays.length === 7 &&
        weekDays[0] instanceof Date &&
        weekDays[6] instanceof Date;

    const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long' });
    const monthName = isWeekValid
        ? (monthFormatter.format(weekDays[0]) === monthFormatter.format(weekDays[6])
            ? monthFormatter.format(weekDays[0])
            : `${monthFormatter.format(weekDays[0])} / ${monthFormatter.format(weekDays[6])}`)
        : '';

    // ----DoubleArrow PrevMonth action-----//
    const handlePrevMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() - 1);
            newDate.setDate(1);
            return newDate;
        });
    };

    // ----DoubleArrow NextMonth action-----//
    const handleNextMonth = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + 1);
            newDate.setDate(1);
            return newDate;
        });
    };

    // ----single arrow action PrevWeek----//
    const handlePrevWeek = () =>
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);

            return newDate;
        });


    // ----single arrow action NextWeek----//
    const handleNextWeek = () =>
        setCurrentDate(prev => {
            console.log(prev, 'prev');
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            console.log(newDate, 'newDate');
            getStartOfWeek(newDate);
            return newDate;
        });


    const formattedDateRange = useMemo(() => {
        const start = weekDays[0]?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const end = weekDays[6]?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        return `${start} to ${end}`;
    }, [weekDays]);


    return (
        <div className='employee-summary'>

            <div className='filter-container'>
                <select>
                    <option value=""> Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>


                <select>
                    <option value=""> Year</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>


                <button className='submit-btn-summary'>Submit</button>

            </div>

            <div className=''>


                <div className='flex-end'>

                    <div
                        className="padding-right-100"
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                        <div onClick={handlePrevMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <KeyboardDoubleArrowLeftIcon />
                        </div>
                        <div
                            onClick={handlePrevWeek}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            <ChevronLeftIcon />
                        </div>
                        <div className="day-month">
                            <span className="ml-5">{formattedDateRange}</span>
                        </div>
                        <div
                            onClick={handleNextWeek}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                            <ChevronRightIcon />
                        </div>
                        <div onClick={handleNextMonth} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <KeyboardDoubleArrowRightIcon />
                        </div>
                    </div>
                </div>
                <table className="your-table-class">
                    <thead>
                        <tr className="tr-height-first">
                            <td className="gray width-30">
                                <div className="pl-8">
                                    <span>Employee Name</span>
                                </div>
                            </td>

                            <td className="tas gray pl-10" style={{ width: "90px" }}>Total Hours</td>
                            {/* <td className="width-27 center">Remarks</td> */}
                            <td colSpan={7} style={{ width: '900px' }}>
                                <div className="d-flex1" style={{ gap: "20px" }}>
                                    {weekDays.map((day, idx) => (
                                        <span key={idx}>{formatDay(day)}</span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='light-blue'><span className='emp-name'>Kishore Sekar</span></td>
                            <td className='center lit-blue'><strong>144:00</strong></td>

                            {weekDays.map((day, index) => {
                                const value = timeEntries[index];

                                const isEightHour =
                                    value === "08:00" || value === "8:00" || value === "8" || value === "08";

                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                let inputClass = "time-input";

                                if (isWeekend) {
                                    inputClass += " gray-style";
                                } else {
                                    inputClass += isEightHour ? " green-style" : " red-style";
                                }

                                return (
                                    <td key={index}>
                                        <input
                                            type="text"
                                            name={`time-${index}`}
                                            value={value}
                                            readOnly
                                            onChange={(e) => {
                                                const updated = [...timeEntries];
                                                updated[index] = e.target.value;
                                                setTimeEntries(updated);
                                            }}
                                            className={inputClass}
                                        />
                                    </td>
                                );
                            })}



                        </tr>

                        <tr>
                            <td className='light-blue'><span className='emp-name'>Stanley</span></td>
                            <td className='center lit-blue'><strong>144:00</strong></td>

                            {weekDays.map((day, index) => {
                                const value = timeEntries[index];

                                const isEightHour =
                                    value === "08:00" || value === "8:00" || value === "8" || value === "08";

                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                let inputClass = "time-input";

                                if (isWeekend) {
                                    inputClass += " gray-style";
                                } else {
                                    inputClass += isEightHour ? " green-style" : " red-style";
                                }

                                return (
                                    <td key={index}>
                                        <input
                                            type="text"
                                            name={`time-${index}`}
                                            value={value}
                                            onChange={(e) => {
                                                const updated = [...timeEntries];
                                                updated[index] = e.target.value;
                                                setTimeEntries(updated);
                                            }}
                                            className={inputClass}
                                        />
                                    </td>
                                );
                            })}



                        </tr>
                    </tbody>



                    <tfoot>
                        <tr className="tr-height">
                            <td></td>
                            <td className='total-hr-summary' style={{ height: "50px", verticalAlign: "middle" ,padding:"0px !important" }}>350:00</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

        </div>
    )
}

export default SummaryTable