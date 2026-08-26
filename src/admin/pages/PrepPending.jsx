import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const PrepPending = () => {
    return <ClientRecordsTable filestate={6} statusFilterKey="prep_pending" />;
};

export default PrepPending;
