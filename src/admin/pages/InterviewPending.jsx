import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const InterviewPending = () => {
    return <ClientRecordsTable filestate={2} statusFilterKey="interview_pending" />;
};

export default InterviewPending;
