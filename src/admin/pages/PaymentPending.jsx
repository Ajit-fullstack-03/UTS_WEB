import React from "react";
import ClientRecordsTable from "../components/ClientRecordsTable";

const PaymentPending = () => {
    return <ClientRecordsTable filestate={8} statusFilterKey="payment_pending" />;
};

export default PaymentPending;
