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

const { PRISMA_ENDPOINT, PRISMA_TOKEN } = window.env || {};

const httpLink = new HttpLink({
	uri: PRISMA_ENDPOINT || 'https://eu1.prisma.sh/lol/homepage-snippets/dev',
	headers: PRISMA_TOKEN ? { Authorization: PRISMA_TOKEN } : {},
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
