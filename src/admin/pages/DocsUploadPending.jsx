import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const DocsUploadPending = () => {
    return <ClientRecordsTable filestate={4} statusFilterKey="docs_upload_pending" />;
};

export default DocsUploadPending;
