import * as React from 'react';
import PropTypes from 'prop-types';
import { withRouter, NavLink } from 'react-router-dom';

import { Site, Nav, Grid, Button } from 'tabler-react';

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

function SiteWrapper({ navBarItems, children }) {
	return (
		<Site.Wrapper
			headerProps={{
				href: '/',
				children: 'Prisma Admin',
				navItems: (
					<Nav.Item type="div" className="d-none d-md-flex">
						<Button
							href="https://github.com/somus/prisma-admin"
							target="_blank"
							outline
							size="sm"
							RootComponent="a"
							color="primary"
						>
							Source code
						</Button>
					</Nav.Item>
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
};

SiteWrapper.defaultProps = {
	navBarItems: [],
};

export default SiteWrapper;
