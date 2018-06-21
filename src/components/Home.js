import React from 'react';

import { Page, Card } from 'tabler-react';

function Home() {
	return (
		<Page.Content>
			<Card>
				<Card.Body>
					<h2>Prisma Admin</h2>
					<p>A clean GUI to manage prisma's graphql API data.</p>
					<h3>Motivation</h3>
					<p>
						I recently started learning graphql and was playing around with it. So, I eventually
						came across{' '}
						<a
							href="https://prisma.io"
							target="_
					blank"
							rel="noopeneer noreferrer"
						>
							prisma
						</a>{' '}
						and started using it. While the graphiql editor which comes with it is great for testing
						the queries and mutations. It is not intuitive for creating or managing data. So, I
						started playing around with the introspection query and made prisma-admin.
					</p>

					<h3>How it works</h3>
					<p>
						Prisma admin uses the introspection query to fetch the schema details for the given
						prisma endpoint from the cli. Then, it filters the query and list all the main types
						from the schema in the nav bar. Each type page shows a paginated list of available data
						where you have the option and add, edit & delete data.
					</p>
				</Card.Body>
			</Card>
		</Page.Content>
	);
}

export default Home;
