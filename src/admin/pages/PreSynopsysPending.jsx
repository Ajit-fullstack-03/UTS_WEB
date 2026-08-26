import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const PreSynopsysPending = () => {
    return <ClientRecordsTable filestate={16} statusFilterKey="pre_synopsys_pending" />;
};

export default PreSynopsysPending;
