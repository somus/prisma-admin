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
	uri: REACT_APP_PRISMA_ENDPOINT || 'https://eu1.prisma.sh/lol/homepage-snippets/dev/',
	headers: REACT_APP_PRISMA_TOKEN ? { Authorization: REACT_APP_PRISMA_TOKEN } : {},
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
