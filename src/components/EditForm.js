import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';

import { Dimmer } from 'tabler-react';
import Form from './Form/Form';

import { camelCase, buildSingleDataQuery } from '../utils';

const EditForm = props => {
	const { type, id, inputTypes, enumTypes } = props;

	return (
		<Query query={buildSingleDataQuery(type, inputTypes)} variables={{ id: id }}>
			{({ loading, data }) => {
				if (loading) return <Dimmer active loader />;

				const editData = data[camelCase(type.name)];

				return (
					<Form {...props} editData={editData} inputTypes={inputTypes} enumTypes={enumTypes} />
				);
			}}
		</Query>
	);
};

EditForm.propTypes = {
	type: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	inputTypes: PropTypes.object.isRequired,
	enumTypes: PropTypes.object.isRequired,
};

export default EditForm;
