import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router' // react-router v4
import { ConnectedRouter } from 'connected-react-router'

import store, {history} from '../store.js';
import AppHeader from './AppHeader.js';
import Home from './Home.js';
import Volunteers from './Volunteers.js';
import Participants from './Participants.js';
import Scheduler from './Scheduler.js';
import Participant from './Participant.js';

const App = () => {
  return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
            <React.Fragment>
              <AppHeader />
              <main role="main">
                  <Switch>
                    <Route path="/participants" component={Participants} />
                    <Route path="/volunteers" component={Volunteers} />
                    <Route exact path="/scheduler" component={Scheduler} />
                    <Route path="/scheduler/participant" component={Participant} />
                    <Route path="/scheduler/volunteer" render={() => (<div>Volunteer</div>)} />
                    <Route path="/" component={Home} />
                  </Switch>
              </main>
            </React.Fragment>
        </ConnectedRouter>
      </Provider>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("app"));
