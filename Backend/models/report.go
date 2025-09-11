package models

import "time"

// PlantHeadReport corresponds to the plant_head_reports table
type PlantHeadReport struct {
	ID                     int       `json:"id"`
	ReportDate             string    `json:"report_date" binding:"required"`
	WasteProcessedTons     *float64  `json:"waste_processed_tons"`
	WasteUnprocessedTons   *float64  `json:"waste_unprocessed_tons"`
	RdfProcessedTons       *float64  `json:"rdf_processed_tons"`
	AfrProcessedTons       *float64  `json:"afr_processed_tons"`
	RagpickerCount         *int      `json:"ragpicker_count"`
	MachineUpTimeHours     *float64  `json:"machine_up_time_hours"`
	MachineDownTimeHours   *float64  `json:"machine_down_time_hours"`
	SortingAccuracyPercent *float64  `json:"sorting_accuracy_percent"`
	MachineIssues          *string   `json:"machine_issues"`
	SafetyIncident         *string   `json:"safety_incident"`
	VipVisit               *string   `json:"vip_visit"`
	EquipmentMaintenance   *string   `json:"equipment_maintenance"`
	PlantStartTime         *string   `json:"plant_start_time"`
	ShredderUpTimeHours    *float64  `json:"shredder_up_time_hours"`
	ShredderDownTimeHours  *float64  `json:"shredder_down_time_hours"`
	TripCount              *int      `json:"trip_count"`
	LostTimeHours          *float64  `json:"lost_time_hours"`
	CreatedByUserID        int       `json:"created_by_user_id,omitempty"`
	CreatedAt              time.Time `json:"created_at,omitempty"`
}

// AsstPlantHeadReport corresponds to the asst_plant_head_reports table
type AsstPlantHeadReport struct {
	ID                          int       `json:"id"`
	ReportDate                  string    `json:"report_date" binding:"required"`
	WasteProcessedTons          *float64  `json:"waste_processed_tons"`
	WasteUnprocessedTippingTons *float64  `json:"waste_unprocessed_tipping_tons"`
	RdfProcessedTons            *float64  `json:"rdf_processed_tons"`
	AfrProcessedTons            *float64  `json:"afr_processed_tons"`
	MachineUpTimeHours          *float64  `json:"machine_up_time_hours"`
	MachineDownTimeHours        *float64  `json:"machine_down_time_hours"`
	MachineIssues               *string   `json:"machine_issues"`
	SafetyIncident              *string   `json:"safety_incident"`
	EquipmentMaintenance        *string   `json:"equipment_maintenance"`
	ShredderUpTimeHours         *float64  `json:"shredder_up_time_hours"`
	ShredderDownTimeHours       *float64  `json:"shredder_down_time_hours"`
	TripCount                   *int      `json:"trip_count"`
	LostTimeHours               *float64  `json:"lost_time_hours"`
	ManpowerNightShift          *int      `json:"manpower_night_shift"`
	CreatedByUserID             int       `json:"created_by_user_id,omitempty"`
	CreatedAt                   time.Time `json:"created_at,omitempty"`
}

// WorkforceMaterialReport corresponds to the workforce_material_reports table
type WorkforceMaterialReport struct {
	ID                          int                    `json:"id"`
	ReportDate                  string                 `json:"report_date" binding:"required"`
	WorkersPresentCount         *int                   `json:"workers_present_count"`
	DieselConsumptionLiters     *float64               `json:"diesel_consumption_liters"`
	ElectricityConsumptionUnits *float64               `json:"electricity_consumption_units"`
	PowerFactor                 *float64               `json:"power_factor"`
	RdfDispatchedTons           *float64               `json:"rdf_dispatched_tons"`
	AfrDispatchedTons           *float64               `json:"afr_dispatched_tons"`
	InertTons                   *float64               `json:"inert_tons"`
	TransportationExpenses      *float64               `json:"transportation_expenses"`
	RecyclablesDispatched       map[string]interface{} `json:"recyclables_dispatched"`
	CreatedByUserID             int                    `json:"created_by_user_id,omitempty"`
	CreatedAt                   time.Time              `json:"created_at,omitempty"`
}
