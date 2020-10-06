import React, {useEffect, useContext} from "react";
import { Route, Switch } from "react-router-dom";

import globalContext from "./context/globalContext";
import Header from "./components/headers/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

function App() {
  const { checkAuth, checkedAuth, user } = useContext(globalContext);

  useEffect(() => {
    checkAuth();
  }, [])

  if (!checkedAuth) {
    return (null);
  }

  return (
      <Switch>
        {user && 
          <Route path="/" component={Header} />
        }
        
        {!user &&
          <>
            <Route exact path="/" component={Landing} />
            <Route exact path="/login" component={Login} />
            <Route
              exact
              path="/register"
              render={(props) => <Login {...props} login={false} />}
            />
          </>
        }
      </Switch>
  );
}

export default App;
