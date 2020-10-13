import React, { useEffect, useContext } from "react";
import { Route, Switch } from "react-router-dom";

import globalContext from "./context/globalContext";
import Header from "./components/headers/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Board from "./pages/Board";
import AddBoardModal from "./components/modals/AddBoardModal";
import Project from "./pages/Project";

function App() {
    const { checkAuth, checkedAuth, authUser } = useContext(globalContext);

    useEffect(() => {
        checkAuth();
    }, []);

    if (!checkedAuth) {
        return null;
    }

    return (
        <Switch>
            {authUser && (
                <>
                    <Route path="/" component={Header} />
                    <Route exact path="/" component={Home} />
                    <Route exact path="/b/:id" component={Board} />
                    <Route exact path="/test" component={AddBoardModal}/>
                    <Route exact path="/p/:id" component={Project} />
                </>
            )}

            {!authUser && (
                <>
                    <Route exact path="/" component={Landing} />
                    <Route exact path="/login" component={Login} />
                    <Route
                        exact
                        path="/register"
                        render={(props) => <Login {...props} login={false} />}
                    />
                </>
            )}
        </Switch>
    );
}

export default App;
