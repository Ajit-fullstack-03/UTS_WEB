import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const SynopsysPending = () => {
    return <ClientRecordsTable filestate={7} statusFilterKey="synopsys_pending" />;
};

export default SynopsysPending;
