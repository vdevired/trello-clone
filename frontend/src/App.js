import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";

import GlobalProvider from './context/GlobalProvider';
import Landing from './pages/Landing';

function App() {
  return (
  	<BrowserRouter>
  		<GlobalProvider>
	    	<Switch>
	    		<Route exact path="/" component={Landing} />
	    	</Switch>
	    </GlobalProvider>
    </BrowserRouter>
  );
}

export default App;
