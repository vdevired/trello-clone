import React, {useEffect, useContext} from "react";
import { Route, Switch } from "react-router-dom";

import globalContext from "./context/globalContext";
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
        {user ? 
          <p>Logged in</p> :
          <Route exact path="/" component={Landing} />
        }
        
        {!user &&
          <>
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
