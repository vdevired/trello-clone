import React, {useEffect, useContext} from "react";
import { Route, Switch } from "react-router-dom";
import Card from './components/boards/Card';

import globalContext from "./context/globalContext";
import Header from "./components/headers/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

const card = {
    title: 'Shite',
    labels: [],
    assigned_to: [],
    attachments: [],
    comments: [], 
    description: ''
};

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
          <>
          <Route path="/" component={Header} />
          <Card card={card} />
          </>
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
