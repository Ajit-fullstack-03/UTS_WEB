import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const InterviewPending = () => {
    return <ClientRecordsTable filestate={3} statusFilterKey="interview_pending" />;
};

export default InterviewPending;
