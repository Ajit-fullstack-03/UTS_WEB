import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const ReviewUploadPending = () => {
    return <ClientRecordsTable filestate={9} statusFilterKey="review_upload_pending" />;
};

export default ReviewUploadPending;
