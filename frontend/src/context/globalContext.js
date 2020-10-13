import React from "react";

export default React.createContext({
    authUser: null,
    checkedAuth: false, // Whether your auth has been checked or not
});
