import gql from 'graphql-tag';
import pluralize, { isPlural } from 'pluralize';

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

export const getDataQueryName = type =>
	// Check is necessary since prisma pluralizes existing plural words
	isPlural(type.name) ? `${camelCase(type.name)}es` : pluralize(camelCase(type.name));

export const getConnectionQueryName = type =>
	// Check is necessary since prisma pluralizes existing plural words
	isPlural(type.name)
		? `${camelCase(type.name)}esConnection`
		: `${pluralize(camelCase(type.name))}Connection`;

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

export const getSchemaInputTypes = schema =>
	schema.types.filter(type => type.kind === 'INPUT_OBJECT').reduce(function(r, type) {
		r[type.name] = type;
		return r;
	}, Object.create(null));

export const getSchemaEnumTypes = schema =>
	schema.types
		.filter(
			type =>
				type.kind === 'ENUM' &&
				!['MutationType', '__DirectiveLocation', '__TypeKind'].includes(type.name) &&
				!type.name.endsWith('Input'),
		)
		.reduce(function(r, type) {
			r[type.name] = type;
			return r;
		}, Object.create(null));

export const getFieldKind = field => {
	switch (field.type.kind) {
		case 'NON_NULL':
			return field.type.ofType.name;
		case 'LIST':
		case 'ENUM':
			return field.type.kind;
		default:
			return field.type.name;
	}
};

export const getListFieldKind = field =>
	field.type.kind === 'LIST' ? field.type.ofType.ofType.name : null;

export const getEnumFieldValues = (field, schemaEnumFields) => {
	if (getFieldKind(field) !== 'ENUM') return null;

	const enumName = field.type.kind === 'NON_NULL' ? field.type.ofType.type.name : field.type.name;

	return schemaEnumFields[enumName].enumValues.map(v => v.name);
};

export const isFieldRequired = field => field.type.kind === 'NON_NULL';

export const getWhereInputName = field =>
	field.args.filter(arg => arg.name === 'where')[0].type.name;

export const getPrimaryRelationField = (field, inputTypes) => {
	const whereInputName = getWhereInputName(field);
	const queryFields = inputTypes[whereInputName].inputFields.filter(
		field => field.description === '',
	);
	const idField = queryFields.filter(field => field.name === 'id')[0];

	return idField || queryFields[0];
};

export const buildDataQuery = (type, inputTypes) => {
	const queryName = getDataQueryName(type);
	const countQueryName = getConnectionQueryName(type);

	return gql`
            query dataQuery($first: Int, $skip: Int) {
				${countQueryName} {
					aggregate {
						count
					}
				}
                ${queryName}(first: $first, skip: $skip) {
                    ${type.fields.reduce((r, field) => {
											if (field.args.length > 0) {
												const primaryRelationField = getPrimaryRelationField(field, inputTypes);

												return `${r}${field.name} { ${primaryRelationField.name} }\n`;
											}

											return `${r}${field.name}\n`;
										}, '')}
                }
            }
		`;
};

export const buildSingleDataQuery = (type, inputTypes) => {
	const queryName = camelCase(type.name);

	return gql`
            query singleDataQuery($id: ID) {
                ${queryName}(where: { id: $id }) {
                    ${type.fields.reduce((r, field) => {
											if (field.args.length > 0) {
												const primaryRelationField = getPrimaryRelationField(field, inputTypes);

												return `${r}${field.name} { ${primaryRelationField.name} }\n`;
											}

											return `${r}${field.name}\n`;
										}, '')}
                }
            }
		`;
};

export const buildDeleteMutation = type => {
	const mutationName = `delete${type.name}`;

	return gql`
            mutation deleteMutation($id: ID) {
                ${mutationName}(where: {
                    id: $id
                }) {
                    ${type.fields
											.filter(field => field.args.length === 0)
											.reduce((r, field) => `${r}${field.name}\n`, '')}
                }
            }
        `;
};

export const buildCreateMutation = (type, inputTypes) => {
	const outputFields = `${type.fields.reduce((r, field) => {
		if (field.args.length > 0) {
			const primaryRelationField = getPrimaryRelationField(field, inputTypes);
			return `${r}${field.name} { ${primaryRelationField.name} }\n`;
		}

		return `${r}${field.name}\n`;
	}, '')}`;

	const createMutationName = `create${type.name}`;

	return gql`
			mutation createMutation($data: ${capitalize(type.name)}CreateInput!) {
				${createMutationName}(data: $data) {
					 ${outputFields}
				}
			}
        `;
};

export const buildUpdateMutation = (type, inputTypes) => {
	const outputFields = `${type.fields.reduce((r, field) => {
		if (field.args.length > 0) {
			const primaryRelationField = getPrimaryRelationField(field, inputTypes);
			return `${r}${field.name} { ${primaryRelationField.name} }\n`;
		}

		return `${r}${field.name}\n`;
	}, '')}`;

	const updateMutationName = `update${type.name}`;

	return gql`
			mutation updateMutation($id: ID!, $data: ${capitalize(type.name)}UpdateInput!) {
				${updateMutationName}(data: $data, where: { id: $id }) {
					 ${outputFields}
				}
			}
        `;
};

export const hasValueChanged = (field, newValue, oldValue) => {
	if (field.type === 'LIST') {
		const mappedOldValue = oldValue.map(v => v[field.primaryRelationField.name]);
		const convertedNewValue = newValue.map(
			v => (['Int', 'Float'].includes(field.listType) ? Number(v) : v),
		);

		return (
			convertedNewValue.length !== mappedOldValue.length ||
			!convertedNewValue.every(v => mappedOldValue.includes(v))
		);
	}

	const convertedNewValue = ['Int', 'Float'].includes(field.type) ? Number(newValue) : newValue;

	return oldValue !== convertedNewValue;
};
