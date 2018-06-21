import * as React from 'react';
import PropTypes from 'prop-types';
import { withRouter, NavLink } from 'react-router-dom';

import { Site, Form, Grid, Button } from 'tabler-react';

import { kebabCase } from '../utils';

const LinkComponent = props => <NavLink {...props} />;

const buildNavbarItems = navBarItems => [
	{ value: 'Home', to: '/', icon: 'home', LinkComponent },
	...navBarItems.map(item => ({
		value: item,
		to: `/model/${kebabCase(item)}`,
		LinkComponent: withRouter(LinkComponent),
	})),
];

function SiteWrapper({ navBarItems, prismaEndpoint, children }) {
	return (
		<Site.Wrapper
			headerProps={{
				href: '/',
				children: (
					<React.Fragment>
						<p className="mv-auto">Prisma Admin</p>
						<Form.Input
							className="ml-auto w-50"
							disabled
							value={prismaEndpoint}
						/>
					</React.Fragment>
				),
			}}
			navProps={{
				itemsObjects: buildNavbarItems(navBarItems),
			}}
			footerProps={{
				copyright: (
					<React.Fragment>
						Copyright © 2018
						<a href="/"> Prisma Admin</a>. All rights reserved.
					</React.Fragment>
				),
				nav: (
					<React.Fragment>
						<Grid.Col auto={true}>
							<Button
								href="https://github.com/somus/prisma-admin"
								target="_blank"
								size="sm"
								outline
								color="primary"
								RootComponent="a"
							>
								Source code
							</Button>
						</Grid.Col>
					</React.Fragment>
				),
			}}
		>
			{children}
		</Site.Wrapper>
	);
}

SiteWrapper.propTypes = {
	navBarItems: PropTypes.array,
	prismaEndpoint: PropTypes.string.isRequired,
};

SiteWrapper.defaultProps = {
	navBarItems: [],
};

export default SiteWrapper;
