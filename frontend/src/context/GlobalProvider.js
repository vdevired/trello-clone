import React, { useReducer } from 'react';
import { useHistory } from 'react-router-dom';

import globalContext from './globalContext';
import { globalReducer, LOGIN, LOGOUT } from './globalReducer';

const GlobalProvider = props => {
  const history = useHistory();
  const [globalState, dispatch] = useReducer(globalReducer, {
     authenticated : false,
     synced : false
  });

  const login = (resData) => {
    localStorage.setItem('accessToken', resData.access);
    localStorage.setItem('refreshToken', resData.refresh);
    dispatch({type : LOGIN});
  }

  const logout = () => {
    dispatch({type : LOGOUT});
    history.push("/");
  }

  return (
    <globalContext.Provider
      value={{
        authenticated: globalState.authenticated,
        synced: globalState.synced,
        login,
        logout,
      }}
    >
      {props.children}
    </globalContext.Provider>
  );
};

export default GlobalProvider;