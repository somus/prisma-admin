import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';

import { Dimmer } from 'tabler-react';
import Form from './Form';

import { camelCase, buildSingleDataQuery } from '../utils';

const EditForm = props => {
	const { type, id } = props;

	return (
		<Query query={buildSingleDataQuery(type)} variables={{ id: id }}>
			{({ loading, data }) => {
				if (loading) return <Dimmer active loader />;

				const editData = data[camelCase(type.name)];

				return <Form {...props} editData={editData} />;
			}}
		</Query>
	);
};

EditForm.propTypes = {
	type: PropTypes.object.isRequired,
	id: PropTypes.object.isRequired,
};

export default EditForm;
