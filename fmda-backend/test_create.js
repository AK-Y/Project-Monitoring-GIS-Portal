const axios = require("axios");

const test = async () => {
  try {
    const data = {
      name_of_work: "Test Project",
      type_of_work: "New Work",
      name_of_agency: "Test Agency",
      budget_during_year: "",
      aa_amount: "",
      aa_date: "",
      dnit_amount: "",
      dnit_date: "",
      tender_date: "",
      allotment_date: "",
      start_date: "",
      completion_date: "",
      revised_completion_date: "",
      time_limit: "",
      dlp: "",
      project_monitoring_by: "",
      physical_progress: "",
      financial_progress: "",
      detail_of_payment: ""
    };
    const res = await axios.post("http://localhost:5000/api/projects", data);
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("FAILED with status:", err.response.status);
      console.error("Error Message:", err.response.data);
    } else {
      console.error("FAILED:", err.message);
    }
  }
};

test();
