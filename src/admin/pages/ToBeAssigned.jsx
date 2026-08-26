import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const ToBeAssigned = () => {
    return <ClientRecordsTable filestate={0} statusFilterKey="to_be_assigned" />;
};

export default ToBeAssigned;
