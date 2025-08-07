import React, { useState, useMemo, useEffect } from 'react';
import { FaUser, FaUserCheck, FaUserTimes, FaCalendarAlt, FaSave, FaSearch, FaUsers, FaFileExcel, FaChevronLeft, FaChevronRight, FaRegClock } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { getEmployees, getAttendance, saveAttendance } from '../services/apiService';

// This function simulates a database of attendance records
const generateMockDb = (employees, date) => {
    const mockDb = {};
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (const emp of employees) {
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (!mockDb[dateStr]) mockDb[dateStr] = {};
            const statuses = ['P', 'P', 'P', 'P', 'P', 'A', 'H']; // Now includes 'H' for Half Day
            mockDb[dateStr][emp.id] = statuses[Math.floor(Math.random() * statuses.length)];
        }
    }
    return mockDb;
};


const AttendancePage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyEmployees, setDailyEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [registerDate, setRegisterDate] = useState(new Date());
    const [monthlyData, setMonthlyData] = useState({});

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const monthStr = `${registerDate.getFullYear()}-${String(registerDate.getMonth() + 1).padStart(2, '0')}`;
            
            const [empRes, attendRes] = await Promise.all([
                getEmployees(),
                getAttendance(monthStr)
            ]);

            const activeEmployees = empRes.data || [];
            setEmployees(activeEmployees);
            const attendanceForMonth = attendRes.data || {};
            setMonthlyData(attendanceForMonth);

            const getStatusFromCode = (code) => {
                if (code === 'A') return 'Absent';
                if (code === 'H') return 'Half Day';
                return 'Present';
            };

            const initialDailyStatus = activeEmployees.map(emp => ({
                ...emp,
                status: getStatusFromCode(attendanceForMonth[dailyDate]?.[emp.id]) || 'Present'
            }));
            setDailyEmployees(initialDailyStatus);

        } catch (error) {
            alert("Failed to load page data.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAllData();
    }, [registerDate]);

    useEffect(() => {
        const getStatusFromCode = (code) => {
            if (code === 'A') return 'Absent';
            if (code === 'H') return 'Half Day';
            return 'Present';
        };
        const dailyStatus = employees.map(emp => ({
            ...emp,
            status: getStatusFromCode(monthlyData[dailyDate]?.[emp.id]) || 'Present'
        }));
        setDailyEmployees(dailyStatus);
    }, [dailyDate, employees, monthlyData]);

    
    const handleStatusChange = (employeeId, newStatus) => {
        setDailyEmployees(dailyEmployees.map(emp =>
            emp.id === employeeId ? { ...emp, status: newStatus } : emp
        ));
    };

    const handleSave = async () => {
        const recordsToSave = dailyEmployees.map(({ id, status }) => ({
            employee_id: id,
            status: status === 'Half Day' ? 'H' : status.charAt(0)
        }));
        try {
            await saveAttendance(dailyDate, recordsToSave);
            alert(`Attendance for ${dailyDate} has been saved.`);
            fetchAllData();
        } catch (error) {
            alert('Failed to save attendance.');
        }
    };
    
    const filteredEmployees = useMemo(() => {
        let filtered = dailyEmployees;
        if (activeFilter !== 'All') {
            filtered = filtered.filter(emp => emp.status === activeFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return filtered;
    }, [dailyEmployees, searchTerm, activeFilter]);

    const attendanceSummary = useMemo(() => {
        return {
            All: dailyEmployees.length,
            Present: dailyEmployees.filter(e => e.status === 'Present').length,
            Absent: dailyEmployees.filter(e => e.status === 'Absent').length,
            'Half Day': dailyEmployees.filter(e => e.status === 'Half Day').length,
        };
    }, [dailyEmployees]);
    
    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaUserCheck className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Mark Daily Attendance</h1>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b">
                     <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="pl-10 p-2 border rounded-lg h-10"/>
                    </div>
                    <div className="flex space-x-2">
                        <FilterButton label="All" count={attendanceSummary.All} activeFilter={activeFilter} onClick={setActiveFilter} icon={<FaUsers />} color="blue" />
                        <FilterButton label="Present" count={attendanceSummary.Present} activeFilter={activeFilter} onClick={setActiveFilter} icon={<FaUserCheck />} color="green" />
                        <FilterButton label="Absent" count={attendanceSummary.Absent} activeFilter={activeFilter} onClick={setActiveFilter} icon={<FaUserTimes />} color="red" />
                        <FilterButton label="Half Day" count={attendanceSummary['Half Day']} activeFilter={activeFilter} onClick={setActiveFilter} icon={<FaRegClock />} color="yellow" />
                    </div>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 p-2 border rounded-full h-10 w-64"/>
                    </div>
                </div>

                {loading ? <div className="text-center py-10">Loading Employees...</div> :
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredEmployees.map(employee => (
                        <EmployeeCard key={employee.id} employee={employee} onStatusChange={handleStatusChange} />
                    ))}
                </div>
                }

                 <div className="flex justify-end mt-6 pt-4 border-t">
                    <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">
                        <FaSave />
                        Save Today's Attendance
                    </button>
                </div>
            </div>

            <MonthlyRegister employees={employees} registerDate={registerDate} setRegisterDate={setRegisterDate} monthlyData={monthlyData} />
        </div>
    );
};


const MonthlyRegister = ({ employees, registerDate, setRegisterDate, monthlyData }) => {
    const daysInMonth = useMemo(() => new Date(registerDate.getFullYear(), registerDate.getMonth() + 1, 0).getDate(), [registerDate]);

    const changeMonth = (delta) => {
        setRegisterDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const handleExport = () => {
        const monthName = registerDate.toLocaleString('default', { month: 'long' });
        const year = registerDate.getFullYear();
        
        const header = ["S.N", "Employee Name", "Designation"];
        for (let i = 1; i <= daysInMonth; i++) header.push(i);
        header.push("Present", "Absent", "Half Day");

        const body = employees.map((emp, index) => {
            const row = [index + 1, emp.name, emp.designation];
            let p = 0, a = 0, h = 0;
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(registerDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = monthlyData[dateStr]?.[emp.id] || '-';
                if(status === 'P') p++;
                if(status === 'A') a++;
                if(status === 'H') h++;
                row.push(status);
            }
            row.push(p, a, h);
            return row;
        });
        
        const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
        worksheet["!cols"] = [{wch: 5}, {wch: 25}, {wch: 15}, ...Array(daysInMonth).fill({wch: 4}), {wch: 8}, {wch: 8}, {wch: 8}];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance ${monthName} ${year}`);
        XLSX.writeFile(workbook, `Attendance_${monthName}_${year}.xlsx`);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Monthly Attendance Register</h2>
                <div className="flex items-center gap-4">
                    <MonthNavigator currentDate={registerDate} changeMonth={changeMonth} />
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                        <FaFileExcel />
                        Export This Month
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="th-sticky left-0 z-10 bg-slate-100">Employee Name</th>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                <th key={day} className="p-2 border font-semibold w-10">{day}</th>
                            ))}
                            <th className="p-2 border bg-green-100 text-green-800">P</th>
                            <th className="p-2 border bg-red-100 text-red-800">A</th>
                            <th className="p-2 border bg-yellow-100 text-yellow-800">H</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => {
                            const summary = { P: 0, A: 0, H: 0 };
                            return (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="td-sticky left-0 z-10 bg-white hover:bg-slate-50">
                                        <div className="font-bold">{emp.name}</div>
                                        <div className="text-xs text-slate-500">{emp.designation}</div>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                        const dateStr = `${registerDate.getFullYear()}-${String(registerDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const status = monthlyData[dateStr]?.[emp.id] || '-';
                                        if (status !== '-') summary[status]++;
                                        return (
                                            <td key={day} className="border text-center font-bold p-0">
                                                <div className={`w-full h-full p-2 ${
                                                    status === 'P' ? 'bg-green-100 text-green-800' :
                                                    status === 'A' ? 'bg-red-100 text-red-800' :
                                                    status === 'H' ? 'bg-yellow-100 text-yellow-800' : 'bg-white'
                                                }`}>
                                                    {status}
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="p-2 border text-center font-bold bg-green-50">{summary.P}</td>
                                    <td className="p-2 border text-center font-bold bg-red-50">{summary.A}</td>
                                    <td className="p-2 border text-center font-bold bg-yellow-50">{summary.H}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FilterButton = ({ label, count, activeFilter, onClick, icon, color }) => {
    const isActive = activeFilter === label;
    const activeClasses = `bg-${color}-500 text-white`;
    const inactiveClasses = `bg-slate-100 text-slate-600 hover:bg-slate-200`;
    return (
        <button onClick={() => onClick(label)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition ${isActive ? activeClasses : inactiveClasses}`}>
            {icon} {label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? `bg-${color}-400` : 'bg-slate-300'}`}>{count}</span>
        </button>
    );
};

const EmployeeCard = ({ employee, onStatusChange }) => {
    const statusStyles = {
        'Present': 'bg-green-50 border-green-400',
        'Absent': 'bg-red-50 border-red-400',
        'Half Day': 'bg-yellow-50 border-yellow-400',
    };
    return (
        <div className={`p-4 rounded-xl shadow-sm border-l-4 transition-all ${statusStyles[employee.status]}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-md">
                    <FaUser className="text-3xl text-slate-400" />
                </div>
                <div>
                    <p className="font-bold text-slate-900">{employee.name}</p>
                    <p className="text-sm text-slate-600">{employee.designation}</p>
                </div>
            </div>
            <div className="flex justify-between gap-2">
                <StatusButton status="Present" currentStatus={employee.status} onClick={() => onStatusChange(employee.id, 'Present')} />
                <StatusButton status="Absent" currentStatus={employee.status} onClick={() => onStatusChange(employee.id, 'Absent')} />
                <StatusButton status="Half Day" currentStatus={employee.status} onClick={() => onStatusChange(employee.id, 'Half Day')} />
            </div>
        </div>
    );
};

const StatusButton = ({ status, currentStatus, onClick }) => {
    const isActive = status === currentStatus;
    const colors = {
        'Present': { active: 'bg-green-500 text-white', inactive: 'bg-green-100 text-green-700 hover:bg-green-200' },
        'Absent': { active: 'bg-red-500 text-white', inactive: 'bg-red-100 text-red-700 hover:bg-red-200' },
        'Half Day': { active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    };
    return (
        <button onClick={onClick} className={`w-full py-1.5 rounded-lg font-semibold text-xs transition ${isActive ? colors[status].active : colors[status].inactive}`}>
            {status}
        </button>
    );
};

const MonthNavigator = ({ currentDate, changeMonth }) => (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded hover:bg-slate-100"><FaChevronLeft /></button>
        <div className="font-bold text-lg w-36 text-center">
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 rounded hover:bg-slate-100"><FaChevronRight /></button>
    </div>
);

const styles = `
.th-sticky, .td-sticky {
    position: sticky;
    left: 0;
    z-index: 1;
    border-right: 2px solid #e2e8f0;
}
.th-sticky {
    background-color: #f1f5f9;
}
.td-sticky {
    background-color: #ffffff;
}
tr:hover .td-sticky {
    background-color: #f8fafc;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default AttendancePage;