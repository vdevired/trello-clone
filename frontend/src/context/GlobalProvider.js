import React, { useReducer } from "react";
import { useHistory } from "react-router-dom";

import { backendUrl } from "../static/js/const";
import { authAxios } from "../static/js/util";
import globalContext from "./globalContext";
import { globalReducer, LOGIN, LOGOUT } from "./globalReducer";

const GlobalProvider = (props) => {
    const history = useHistory();
    const [globalState, dispatch] = useReducer(globalReducer, {
        authUser: null,
        checkedAuth: false,
    });

    const login = async (resData) => {
        localStorage.setItem("accessToken", resData.access);
        localStorage.setItem("refreshToken", resData.refresh);
        const url = backendUrl + "/me/";

        // No try catch block so error bubbles up to LoginForm.js to be handled there
        const { data: user } = await authAxios.get(url);
        dispatch({ type: LOGIN, user });
        history.push("/");
    };

    const checkAuth = async () => {
        const url = backendUrl + "/me/";
        try {
            const { data: user } = await authAxios.get(url);
            dispatch({ type: LOGIN, user });
        } catch (err) {
            dispatch({ type: LOGOUT });
        }
    };

    const logout = () => {
        dispatch({ type: LOGOUT });
        history.push("/login");
    };

    return (
        <globalContext.Provider
            value={{
                authUser: globalState.authUser,
                checkedAuth: globalState.checkedAuth,
                checkAuth,
                login,
                logout,
            }}
        >
            {props.children}
        </globalContext.Provider>
    );
};

export default GlobalProvider;
