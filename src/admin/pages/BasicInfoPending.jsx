import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const BasicInfoPending = () => {
    return <ClientRecordsTable filestate={1} statusFilterKey="basic_info_pending" />;
};

export default BasicInfoPending;
