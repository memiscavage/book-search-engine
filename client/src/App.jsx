import './App.css';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache, concat } from '@apollo/client';

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    const token = localStorage.getItem('authjwt')
    return {
      headers: {
        ...headers,
        authorization: token?`Bearer ${token}`: null
      }
    }
  })
  return forward(operation)
})

const httpLink = new HttpLink({
  uri: '/graphql'
})

const client = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
})

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
