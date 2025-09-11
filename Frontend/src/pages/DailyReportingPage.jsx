import React, { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaExclamationTriangle, FaTools, FaInfoCircle, FaClock, FaPaperPlane, FaMountain, FaRecycle, FaUsers, FaTruck, FaUserFriends, FaGasPump, FaBolt, FaFileInvoiceDollar } from 'react-icons/fa';
import authService from '../services/authService';
import { createPlantHeadReport, createAsstPlantHeadReport, createWorkforceMaterialReport } from '../services/apiService';

// --- Reusable Components ---
const Section = ({ title, icon, children, cols = 'md:grid-cols-2' }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 mb-4 border-b pb-3">
            {icon}
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className={`grid grid-cols-1 ${cols} gap-6`}>
            {children}
        </div>
    </div>
);

const InputField = ({ name, value, onChange, label, type = 'number', placeholder, icon, note }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {note && <p className="text-xs text-slate-500 mb-1">{note}</p>}
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    </div>
);

const TimeInputField = ({ name, value, onChange, label, icon }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
            <input
                type="text"
                placeholder="e.g., 7:30 AM"
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    </div>
);


const TextAreaField = ({ name, value, onChange, label, placeholder, rows = 3, isOptional = false }) => (
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {isOptional && <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        <textarea
            name={name}
            placeholder={placeholder}
            rows={rows}
            value={value || ''}
            onChange={onChange}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
    </div>
);

// --- Report Specific Components ---
const ReportTemplate = ({ children, onSubmit }) => (
    <form onSubmit={onSubmit}>
        <div className="space-y-8">{children}</div>
    </form>
);

const SubmitButtonSection = ({ isSubmitting }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg mt-8">
        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-slate-400"
            >
                <FaPaperPlane />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
        </div>
    </div>
);

const PlantHeadReport = ({ reportData, handleInputChange, handleSubmit, isSubmitting }) => (
    <ReportTemplate onSubmit={handleSubmit}>
        <Section title="Waste Management" icon={<FaRecycle className="text-2xl text-green-500" />}>
            <InputField name="waste_processed_tons" value={reportData.waste_processed_tons} onChange={handleInputChange} label="Waste Processed (Tons)" placeholder="e.g., 50.5" icon={<FaChartLine />} />
            <InputField name="waste_unprocessed_tons" value={reportData.waste_unprocessed_tons} onChange={handleInputChange} label="Waste Unprocessed (Tons)" placeholder="e.g., 10.2" icon={<FaMountain />} />
            <InputField name="rdf_processed_tons" value={reportData.rdf_processed_tons} onChange={handleInputChange} label="RDF Processed (Tons)" placeholder="e.g., 20.1" icon={<FaChartLine />} />
            <InputField name="afr_processed_tons" value={reportData.afr_processed_tons} onChange={handleInputChange} label="AFR Processed (Tons)" placeholder="e.g., 5.8" icon={<FaChartLine />} />
            <InputField name="ragpicker_count" value={reportData.ragpicker_count} onChange={handleInputChange} label="Ragpicker Count Present Today" placeholder="e.g., 25" icon={<FaUsers />} />
        </Section>
        <Section title="Plant Performance & Key Events" icon={<FaChartLine className="text-2xl text-purple-500" />}>
            <InputField name="machine_up_time_hours" value={reportData.machine_up_time_hours} onChange={handleInputChange} label="Machine Up Time (Hours)" placeholder="e.g., 22" icon={<FaClock />} />
            <InputField name="machine_down_time_hours" value={reportData.machine_down_time_hours} onChange={handleInputChange} label="Machine Down Time (Hours)" placeholder="e.g., 2" icon={<FaClock />} />
            <InputField name="sorting_accuracy_percent" value={reportData.sorting_accuracy_percent} onChange={handleInputChange} label="Sorting Accuracy (%)" placeholder="e.g., 95" icon={<FaInfoCircle />} />
            <TextAreaField name="machine_issues" value={reportData.machine_issues} onChange={handleInputChange} label="Any Machine Issues Today?" placeholder="Describe any machine breakdowns or issues..." isOptional />
            <TextAreaField name="safety_incident" value={reportData.safety_incident} onChange={handleInputChange} label="Any Safety Incident Today?" placeholder="Describe any safety incidents or near-misses..." isOptional />
            <TextAreaField name="vip_visit" value={reportData.vip_visit} onChange={handleInputChange} label="Any VIP Visit Today?" placeholder="Mention any VIP visits and their purpose..." isOptional />
        </Section>
        <Section title="Maintenance & Equipment Usage" icon={<FaTools className="text-2xl text-orange-500" />} cols="md:grid-cols-1">
             <TextAreaField name="equipment_maintenance" value={reportData.equipment_maintenance} onChange={handleInputChange} label="Equipment Maintenance Performed Today?" placeholder="List any maintenance activities performed on equipment..." />
        </Section>
        <Section title="Other Information" icon={<FaInfoCircle className="text-2xl text-gray-500" />}>
            <TimeInputField name="plant_start_time" value={reportData.plant_start_time} onChange={handleInputChange} label="Plant Start Time" icon={<FaClock />} />
            <InputField name="shredder_up_time_hours" value={reportData.shredder_up_time_hours} onChange={handleInputChange} label="Shredder UP Time (Hours)" placeholder="e.g., 8" icon={<FaClock />} />
            <InputField name="shredder_down_time_hours" value={reportData.shredder_down_time_hours} onChange={handleInputChange} label="Shredder Down Time (Hours)" placeholder="e.g., 1" icon={<FaClock />} />
            <InputField name="trip_count" value={reportData.trip_count} onChange={handleInputChange} label="Number of Trips" placeholder="e.g., 15" icon={<FaTruck />} />
            <InputField name="lost_time_hours" value={reportData.lost_time_hours} onChange={handleInputChange} label="Lost Time (Hours)" placeholder="e.g., 0.5" icon={<FaClock />} />
        </Section>
        <SubmitButtonSection isSubmitting={isSubmitting} />
    </ReportTemplate>
);

const AsstPlantHeadReport = ({ reportData, handleInputChange, handleSubmit, isSubmitting }) => (
    <ReportTemplate onSubmit={handleSubmit}>
        <Section title="Waste Management" icon={<FaRecycle className="text-2xl text-green-500" />}>
            <InputField name="waste_processed_tons" value={reportData.waste_processed_tons} onChange={handleInputChange} label="Waste Processed (Tons)" placeholder="e.g., 50.5" icon={<FaChartLine />} />
            <InputField name="waste_unprocessed_tipping_tons" value={reportData.waste_unprocessed_tipping_tons} onChange={handleInputChange} label="Waste Unprocessed (Tons)" note="Tipping Area" placeholder="e.g., 10.2" icon={<FaMountain />} />
            <InputField name="rdf_processed_tons" value={reportData.rdf_processed_tons} onChange={handleInputChange} label="RDF Processed (Tons)" placeholder="e.g., 20.1" icon={<FaChartLine />} />
            <InputField name="afr_processed_tons" value={reportData.afr_processed_tons} onChange={handleInputChange} label="AFR Processed (Tons)" placeholder="e.g., 5.8" icon={<FaChartLine />} />
        </Section>
        <Section title="Plant Performance & Key Events" icon={<FaChartLine className="text-2xl text-purple-500" />}>
            <InputField name="machine_up_time_hours" value={reportData.machine_up_time_hours} onChange={handleInputChange} label="Machine Up Time (Hours)" placeholder="e.g., 22" icon={<FaClock />} />
            <InputField name="machine_down_time_hours" value={reportData.machine_down_time_hours} onChange={handleInputChange} label="Machine Down Time (Hours)" placeholder="e.g., 2" icon={<FaClock />} />
            <TextAreaField name="machine_issues" value={reportData.machine_issues} onChange={handleInputChange} label="Any Machine Issues Today?" placeholder="Describe any machine breakdowns or issues..." />
            <TextAreaField name="safety_incident" value={reportData.safety_incident} onChange={handleInputChange} label="Any Safety Incident Today?" placeholder="Describe any safety incidents or near-misses..." />
        </Section>
        <Section title="Maintenance & Equipment Usage" icon={<FaTools className="text-2xl text-orange-500" />} cols="md:grid-cols-1">
             <TextAreaField name="equipment_maintenance" value={reportData.equipment_maintenance} onChange={handleInputChange} label="Equipment Maintenance Performed Today?" placeholder="List any maintenance activities performed on equipment..." />
        </Section>
        <Section title="Shredder Performance" icon={<FaRecycle className="text-2xl text-blue-500" />}>
            <InputField name="shredder_up_time_hours" value={reportData.shredder_up_time_hours} onChange={handleInputChange} label="Shredder UP time (Hours)" placeholder="e.g., 8" icon={<FaClock />} />
            <InputField name="shredder_down_time_hours" value={reportData.shredder_down_time_hours} onChange={handleInputChange} label="Shredder Down time (Hours)" placeholder="e.g., 1" icon={<FaClock />} />
            <InputField name="trip_count" value={reportData.trip_count} onChange={handleInputChange} label="No of Trips" placeholder="e.g., 15" icon={<FaTruck />} />
            <InputField name="lost_time_hours" value={reportData.lost_time_hours} onChange={handleInputChange} label="Lost Time (Hours)" placeholder="e.g., 0.5" icon={<FaClock />} />
            <InputField name="manpower_night_shift" value={reportData.manpower_night_shift} onChange={handleInputChange} label="Total Manpower Night Shift (Labor)" placeholder="e.g., 12" icon={<FaUserFriends />} />
        </Section>
        <SubmitButtonSection isSubmitting={isSubmitting} />
    </ReportTemplate>
);

const WorkforceAndMaterialOutputReport = ({ reportData, handleInputChange, handleSubmit, isSubmitting }) => (
    <ReportTemplate onSubmit={handleSubmit}>
        <Section title="Workforce & Consumption" icon={<FaUsers className="text-2xl text-blue-500" />}>
            <InputField name="workers_present_count" value={reportData.workers_present_count} onChange={handleInputChange} label="Number of Workers Present Today" placeholder="e.g., 50" icon={<FaUsers />} />
            <InputField name="diesel_consumption_liters" value={reportData.diesel_consumption_liters} onChange={handleInputChange} label="Diesel Consumption (liters)" placeholder="e.g., 150.5" icon={<FaGasPump />} />
            <InputField name="electricity_consumption_units" value={reportData.electricity_consumption_units} onChange={handleInputChange} label="Electricity Consumption (Units)" placeholder="e.g., 800" icon={<FaBolt />} />
            <InputField name="power_factor" value={reportData.power_factor} onChange={handleInputChange} label="Power Factor" placeholder="e.g., 0.98" icon={<FaChartLine />} />
        </Section>
        <Section title="Material & Output Tracking" icon={<FaTruck className="text-2xl text-purple-500" />}>
            <InputField name="rdf_dispatched_tons" value={reportData.rdf_dispatched_tons} onChange={handleInputChange} label="RDF Dispatched Today (tons)" placeholder="e.g., 20.1" icon={<FaTruck />} />
            <InputField name="afr_dispatched_tons" value={reportData.afr_dispatched_tons} onChange={handleInputChange} label="AFR Dispatched Today (tons)" placeholder="e.g., 5.8" icon={<FaTruck />} />
            <InputField name="inert_tons" value={reportData.inert_tons} onChange={handleInputChange} label="Inert (tons)" placeholder="e.g., 15.2" icon={<FaMountain />} />
            <InputField name="transportation_expenses" value={reportData.transportation_expenses} onChange={handleInputChange} label="Transportation Expenses Today" placeholder="e.g., 5000" icon={<FaFileInvoiceDollar />} />
        </Section>
        <SubmitButtonSection isSubmitting={isSubmitting} />
    </ReportTemplate>
);


const DailyReportingPage = () => {
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportType, setReportType] = useState('plantHead');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dateInputRef = useRef(null);

    const initialFormState = {
        plantHead: {},
        asstPlantHead: {},
        workforceAndMaterial: {}
    };
    const [formsData, setFormsData] = useState(initialFormState);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            // Set default report based on designation
            if (user.designation === 'Plant Head') {
                setReportType('plantHead');
            } else if (user.designation === 'Assistant Plant Head') {
                setReportType('asstPlantHead');
            } else if (user.designation === 'Transport manager') {
                setReportType('workforceAndMaterial');
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormsData(prev => ({
            ...prev,
            [reportType]: {
                ...prev[reportType],
                [name]: value
            }
        }));
    };
    
    // --- THIS IS THE FIX ---
    const prepareRequestData = (formData) => {
        const processedData = {};
        for (const key in formData) {
            const value = formData[key];
            const numericFields = [
                'waste_processed_tons', 'waste_unprocessed_tons', 'rdf_processed_tons', 'afr_processed_tons',
                'ragpicker_count', 'machine_up_time_hours', 'machine_down_time_hours', 'sorting_accuracy_percent',
                'shredder_up_time_hours', 'shredder_down_time_hours', 'trip_count', 'lost_time_hours',
                'waste_unprocessed_tipping_tons', 'manpower_night_shift', 'workers_present_count',
                'diesel_consumption_liters', 'electricity_consumption_units', 'power_factor',
                'rdf_dispatched_tons', 'afr_dispatched_tons', 'inert_tons', 'transportation_expenses'
            ];

            if (numericFields.includes(key)) {
                processedData[key] = value === '' ? null : parseFloat(value);
            } else {
                processedData[key] = value === '' ? null : value;
            }
        }
        return processedData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const preparedData = prepareRequestData(formsData[reportType]);
        const data = {
            report_date: reportDate,
            ...preparedData
        };

        try {
            switch (reportType) {
                case 'plantHead':
                    await createPlantHeadReport(data);
                    break;
                case 'asstPlantHead':
                    await createAsstPlantHeadReport(data);
                    break;
                case 'workforceAndMaterial':
                    await createWorkforceMaterialReport(data);
                    break;
                default:
                    throw new Error("Invalid report type");
            }
            alert('Report submitted successfully!');
            setFormsData(initialFormState); // Clear all forms
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit report.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderReport = () => {
        const props = {
            handleInputChange,
            handleSubmit,
            isSubmitting
        };
        switch (reportType) {
            case 'plantHead':
                return <PlantHeadReport {...props} reportData={formsData.plantHead} />;
            case 'asstPlantHead':
                return <AsstPlantHeadReport {...props} reportData={formsData.asstPlantHead} />;
            case 'workforceAndMaterial':
                return <WorkforceAndMaterialOutputReport {...props} reportData={formsData.workforceAndMaterial} />;
            default:
                return null;
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Daily Operations Report</h1>
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full p-2 border rounded-lg h-10 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="plantHead">Plant Head Report</option>
                        <option value="asstPlantHead">Asst. Plant Head Report</option>
                        <option value="workforceAndMaterial">Workforce & Material Output</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className='w-full md:w-1/3'>
                    <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700 mb-1">Reporting Date</label>
                    <div
                        className="relative h-10 w-full border border-slate-300 rounded-lg flex items-center px-3 bg-white cursor-pointer"
                        onClick={() => dateInputRef.current?.showPicker()}
                    >
                        <span>
                            {new Date(reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            ref={dateInputRef}
                            type="date"
                            id="reportDate"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>
            
            {renderReport()}

        </div>
    );
};

export default DailyReportingPage;