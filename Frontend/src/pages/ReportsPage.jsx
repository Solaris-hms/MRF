import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { getPlantHeadReports, getAsstPlantHeadReports, getWorkforceMaterialReports } from '../services/apiService';

const ReportCard = ({ report, type }) => {
    const reportDate = new Date(report.report_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const DetailItem = ({ label, value, unit = '' }) => (
        <p><strong>{label}:</strong> {value ?? 'N/A'} {unit}</p>
    );

    const renderDetails = () => {
        switch (type) {
            case 'plantHead':
                return (
                    <>
                        <DetailItem label="Waste Processed" value={report.waste_processed_tons} unit="Tons" />
                        <DetailItem label="Waste Unprocessed" value={report.waste_unprocessed_tons} unit="Tons" />
                        <DetailItem label="RDF Processed" value={report.rdf_processed_tons} unit="Tons" />
                        <DetailItem label="AFR Processed" value={report.afr_processed_tons} unit="Tons" />
                        <DetailItem label="Machine Up Time" value={report.machine_up_time_hours} unit="hrs" />
                        <DetailItem label="Machine Down Time" value={report.machine_down_time_hours} unit="hrs" />
                        <DetailItem label="Ragpickers Present" value={report.ragpicker_count} />
                        <DetailItem label="Sorting Accuracy" value={report.sorting_accuracy_percent} unit="%" />
                        <DetailItem label="Shredder Up Time" value={report.shredder_up_time_hours} unit="hrs" />
                        <DetailItem label="Shredder Down Time" value={report.shredder_down_time_hours} unit="hrs" />
                        <DetailItem label="Trip Count" value={report.trip_count} />
                        <DetailItem label="Lost Time" value={report.lost_time_hours} unit="hrs" />
                        <DetailItem label="Plant Start Time" value={report.plant_start_time} />
                        <DetailItem label="Machine Issues" value={report.machine_issues} />
                        <DetailItem label="Safety Incident" value={report.safety_incident} />
                        <DetailItem label="VIP Visit" value={report.vip_visit} />
                        <DetailItem label="Equipment Maintenance" value={report.equipment_maintenance} />
                    </>
                );
            case 'asstPlantHead':
                return (
                    <>
                        <DetailItem label="Waste Processed" value={report.waste_processed_tons} unit="Tons" />
                        <DetailItem label="Unprocessed (Tipping)" value={report.waste_unprocessed_tipping_tons} unit="Tons" />
                        <DetailItem label="RDF Processed" value={report.rdf_processed_tons} unit="Tons" />
                        <DetailItem label="AFR Processed" value={report.afr_processed_tons} unit="Tons" />
                        <DetailItem label="Machine Up Time" value={report.machine_up_time_hours} unit="hrs" />
                        <DetailItem label="Machine Down Time" value={report.machine_down_time_hours} unit="hrs" />
                        <DetailItem label="Shredder Up Time" value={report.shredder_up_time_hours} unit="hrs" />
                        <DetailItem label="Shredder Down Time" value={report.shredder_down_time_hours} unit="hrs" />
                        <DetailItem label="Trip Count" value={report.trip_count} />
                        <DetailItem label="Lost Time" value={report.lost_time_hours} unit="hrs" />
                        <DetailItem label="Manpower (Night)" value={report.manpower_night_shift} />
                        <DetailItem label="Machine Issues" value={report.machine_issues} />
                        <DetailItem label="Safety Incident" value={report.safety_incident} />
                        <DetailItem label="Equipment Maintenance" value={report.equipment_maintenance} />
                    </>
                );
            case 'workforceAndMaterial':
                return (
                    <>
                        <DetailItem label="Workers Present" value={report.workers_present_count} />
                        <DetailItem label="Diesel Used" value={report.diesel_consumption_liters} unit="L" />
                        <DetailItem label="Electricity Used" value={report.electricity_consumption_units} unit="Units" />
                        <DetailItem label="Power Factor" value={report.power_factor} />
                        <DetailItem label="RDF Dispatched" value={report.rdf_dispatched_tons} unit="Tons" />
                        <DetailItem label="AFR Dispatched" value={report.afr_dispatched_tons} unit="Tons" />
                        <DetailItem label="Inert" value={report.inert_tons} unit="Tons" />
                        <p><strong>Transportation Expenses:</strong> ₹ {report.transportation_expenses ?? 'N/A'}</p>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">{reportDate}</h3>
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {
                        {
                            plantHead: 'Plant Head',
                            asstPlantHead: 'Asst. Plant Head',
                            workforceAndMaterial: 'Workforce & Material'
                        }[type]
                    }
                </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
                {renderDetails()}
            </div>
        </div>
    );
};


const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('plantHead');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                let response;
                if (reportType === 'plantHead') {
                    response = await getPlantHeadReports();
                } else if (reportType === 'asstPlantHead') {
                    response = await getAsstPlantHeadReports();
                } else {
                    response = await getWorkforceMaterialReports();
                }
                setReports(response.data || []);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [reportType]);

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaFileAlt className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Submitted Reports</h1>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
                <FaFilter className="text-slate-500" />
                <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="p-2 border rounded-lg h-10 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                    <option value="plantHead">Plant Head Reports</option>
                    <option value="asstPlantHead">Asst. Plant Head Reports</option>
                    <option value="workforceAndMaterial">Workforce & Material Reports</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center p-8">Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.length > 0 ? (
                        reports.map(report => <ReportCard key={report.id} report={report} type={reportType} />)
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <p>No reports found for this category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;