import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const OtherDocsPending = () => {
    return <ClientRecordsTable filestate={5} statusFilterKey="other_docs_pending" />;
};

export default OtherDocsPending;
