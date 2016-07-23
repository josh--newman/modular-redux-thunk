import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import thunk from 'redux-thunk';

import combineSelectors from './selectors.js';
import combineActions, { pickActionsWrapper } from './actions.js';

export default (reducerData, { globalSelectors={}, globalActions={} }={}) => {

  const reducers = {};
  const selectors = {};
  const actions = {};

  Object.keys(reducerData).map(name => {
    reducers[name] = reducerData[name]['reducer'];
    selectors[name] = reducerData[name]['selectors'];
    actions[name] = reducerData[name]['actions'];
  });

  // Create the root reducer which combines all other reducers.
  // This is also where react-router-redux is included
  const rootReducer = combineReducers(reducers, {
    routing: routing
  }));

  // Combine all reducer's selectors and any global selectors into one.
  const selectors = combineSelectors(selectors, globalSelectors);

  // Combine all actions and return the action props creator function
  const actions = combineActions(actions, globalActions);
  const pickActions = pickActionsWrapper(actions);

  // Thunk allows us to create async actions.
  const middleware = [thunk];
  let devToolsExtension = f => f;
  if (process.env.NODE_ENV !== 'production') {
    // Ensure the state is never modified directly
    middleware.push(require('redux-freeze'));

    // Allow use of the Redux DevTools Chrome extension.
    // (https://github.com/zalmoxisus/redux-devtools-extension)
    if(window.devToolsExtension) {
      devToolsExtension = window.devToolsExtension();
    }
  }

  // Create the store with all middleware and include devToolsExtension if
  // local and the extension is installed.
  const store = createStore(rootReducer, undefined, compose(
    applyMiddleware(...middleware),
    devToolsExtension
  ));

  return { store, selectors, actions, pickActions };
};