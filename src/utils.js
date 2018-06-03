import gql from 'graphql-tag';

export const LIMIT = 10;

export const kebabCase = string =>
	string
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/\s+/g, '-')
		.toLowerCase();

export const snakeCase = string =>
	string
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/\s+/g, '_')
		.toLowerCase();

export const camelCase = string =>
	string
		.replace(
			/(?:^\w|[A-Z]|\b\w)/g,
			(letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()),
		)
		.replace(/\s+/g, '');

export const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

export const getSchemaMainTypes = schema =>
	schema.types
		.filter(
			type =>
				type.kind === 'OBJECT' &&
				!type.name.startsWith('__') &&
				!type.name.startsWith('Aggregate') &&
				!type.name.endsWith('PreviousValues') &&
				!type.name.endsWith('Edge') &&
				!type.name.endsWith('Connection') &&
				!type.name.endsWith('SubscriptionPayload') &&
				!['Query', 'Mutation', 'PageInfo', 'Subscription', 'BatchPayload'].includes(type.name),
		)
		.reduce(function(r, type) {
			r[kebabCase(type.name)] = type;
			return r;
		}, Object.create(null));

export const getInputTypeFields = type => type.fields.filter(field => field.args.length <= 1);

export const getFieldKind = field =>
	field.type.kind !== 'NON_NULL' ? field.type.name : field.type.ofType.name;

export const isFieldRequired = field => field.type.kind === 'NON_NULL';

export const buildDataQuery = type => {
	const queryName = `${camelCase(type.name)}s`;
	const fields = getInputTypeFields(type);

	return gql`
            query dataQuery($first: Int, $skip: Int) {
                ${queryName}(first: $first, skip: $skip) {
                    ${fields.reduce((r, field) => {
											if (field.args.length === 1) {
												return `${r}${field.name} { id }\n`;
											}

											return `${r}${field.name}\n`;
										}, '')}
                }
            }
		`;
};

export const buildSingleDataQuery = type => {
	const queryName = camelCase(type.name);
	const fields = getInputTypeFields(type);

	return gql`
            query singleDataQuery($id: ID) {
                ${queryName}(where: { id: $id }) {
                    ${fields.reduce((r, field) => {
											if (field.args.length === 1) {
												return `${r}${field.name} { id }\n`;
											}

											return `${r}${field.name}\n`;
										}, '')}
                }
            }
		`;
};

export const buildCountQuery = type => {
	const countQueryName = `${camelCase(type.name)}sConnection`;
	return gql`
			query countQuery {
				${countQueryName} {
					aggregate {
						count
					}
				}
			}
        `;
};

export const buildDeleteMutation = type => {
	const mutationName = `delete${type.name}`;
	const fields = getInputTypeFields(type);

	return gql`
            mutation deleteMutation($id: ID) {
                ${mutationName}(where: {
                    id: $id
                }) {
                    ${fields
											.filter(field => field.args.length === 0)
											.reduce((r, field) => `${r}${field.name}\n`, '')}
                }
            }
        `;
};

export const buildCreateMutation = (type, formInputs) => {
	const fields = getInputTypeFields(type);
	const outputFields = `${fields.reduce((r, field) => {
		if (field.args.length === 1) {
			return `${r}${field.name} { id }\n`;
		}

		return `${r}${field.name}\n`;
	}, '')}`;

	const createMutationName = `create${type.name}`;
	const mutationInputs = `${formInputs.reduce(
		(r, field) =>
			`${r}$${field.name}: ${field.isRelationField ? 'ID' : field.type}${
				field.isRequired ? '!' : ''
			}, `,
		'',
	)}`;
	const prismaMutationInputs = `${formInputs.reduce((r, field) => {
		if (field.isRelationField) {
			return `${r}${field.name}: { connect: { id: $${field.name} } }, `;
		}

		return `${r}${field.name}: $${field.name}, `;
	}, '')}`;

	return gql`
			mutation createMutation(${mutationInputs}) {
				${createMutationName}(data: { ${prismaMutationInputs} }) {
					 ${outputFields}
				}
			}
        `;
};

export const buildUpdateMutation = (type, formInputs) => {
	const fields = getInputTypeFields(type);
	const outputFields = `${fields.reduce((r, field) => {
		if (field.args.length === 1) {
			return `${r}${field.name} { id }\n`;
		}

		return `${r}${field.name}\n`;
	}, '')}`;

	const updateMutationName = `update${type.name}`;
	const mutationInputs = `${formInputs.reduce(
		(r, field) =>
			`${r}$${field.name}: ${field.isRelationField ? 'ID' : field.type}${
				field.isRequired ? '!' : ''
			}, `,
		'$id: ID!, ',
	)}`;
	const prismaMutationInputs = `${formInputs.reduce((r, field) => {
		if (field.isRelationField) {
			return `${r}${field.name}: { connect: { id: $${field.name} } }, `;
		}

		return `${r}${field.name}: $${field.name}, `;
	}, '')}`;

	return gql`
			mutation updateMutation(${mutationInputs}) {
				${updateMutationName}(data: { ${prismaMutationInputs} }, where: { id: $id }) {
					 ${outputFields}
				}
			}
        `;
};
