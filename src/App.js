import React from 'react';
import './App.css';
import fetchGraphQL from './api/fetchGraphQL';
import graphql from 'babel-plugin-relay/macro';
import {
  RelayEnvironmentProvider,
  loadQuery,
  usePreloadedQuery,
} from 'react-relay/hooks';
import RelayEnvironment from './RelayEnvironment';

const { Suspense } = React;

// Define a query
const RepositoryNameQuery = graphql`
  query AppRepositoryNameQuery {
    user(login: "artem-tarasenko") {
    name
    login
    location
    createdAt
    avatarUrl
    url
    repositories(first: 4) {
      totalCount
      nodes {
        name
        description
      }
    }
  }
  }
`;

// Immediately load the query as our app starts. For a real app, we'd move this
// into our routing configuration, preloading data as we transition to new routes.
const preloadedQuery = loadQuery(RelayEnvironment, RepositoryNameQuery, {
  /* query variables */
});

// Inner component that reads the preloaded query results via `usePreloadedQuery()`.
// This works as follows:
// - If the query has completed, it returns the results of the query.
// - If the query is still pending, it "suspends" (indicates to React that the
//   component isn't ready to render yet). This will show the nearest <Suspense>
//   fallback.
// - If the query failed, it throws the failure error. For simplicity we aren't
//   handling the failure case here.
function App(props) {
  const {user} = usePreloadedQuery(RepositoryNameQuery, props.preloadedQuery);

  return (
    <div className="App">
      <header className="App-header">
        <img src={user.avatarUrl} alt="user" style={{width: 120, borderRaduis: 60}}/>
        <p>User name: {user.name}</p>
        <p>Login: {user.login}</p>
        <p>Live in: {user.location}</p>
        <p>Create date: {user.createdAt}</p>
        <p>Url: {user.url}</p>
        <p>Repos: {user.repositories.totalCount}</p>
      </header>
    </div>
  );
}

function Loader( {msg} ) {
  return (
    <div className="App">
      <header className="App-header">
        <p>{msg}</p>
      </header>
    </div>
  );
}

// The above component needs to know how to access the Relay environment, and we
// need to specify a fallback in case it suspends:
// - <RelayEnvironmentProvider> tells child components how to talk to the current
//   Relay Environment instance
// - <Suspense> specifies a fallback in case a child suspends.
function AppRoot(props) {
  return (
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <Suspense fallback={<Loader msg={'Loading data...'} />}>
        <App preloadedQuery={preloadedQuery} />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}

export default AppRoot;