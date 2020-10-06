import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import GlobalProvider from "./context/GlobalProvider";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/login" component={Login} />
          <Route
            exact
            path="/register"
            render={(props) => <Login {...props} login={false} />}
          />
        </Switch>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default App;
