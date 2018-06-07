import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const { REACT_APP_PRISMA_ENDPOINT, REACT_APP_PRISMA_TOKEN } = process.env;
const httpLink = new HttpLink({
	uri: REACT_APP_PRISMA_ENDPOINT || 'https://us1.prisma.sh/somasundaram-ayyappan-9dd303/airbnb/dev',
	headers: REACT_APP_PRISMA_TOKEN
		? { Authorization: REACT_APP_PRISMA_TOKEN }
		: {
				Authorization:
					'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Mjg0MjQyNDksIm5iZiI6MTUyODMzNzg0OX0.VRCC7WpPQHgM6lT-KDoV5lUDVNsKi5TpeMyx0Vvyw30',
		  },
});

const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache(),
});

ReactDOM.render(
	<BrowserRouter>
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</BrowserRouter>,
	document.getElementById('root'),
);
registerServiceWorker();
