import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';

import { Page, Form, Grid, Card, Button, Alert } from 'tabler-react';
import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';

import {
	LIMIT,
	getFieldKind,
	isFieldRequired,
	capitalize,
	getDataQueryName,
	snakeCase,
	buildDataQuery,
	buildCreateMutation,
	buildUpdateMutation,
	getListFieldKind,
} from '../utils';

class DataForm extends Component {
	constructor(props) {
		super(props);
		const { type, editData } = props;

		const getEditValue = (fieldName, isRelationField) => {
			if (!editData) return null;
			const fieldValue = editData[fieldName];

			if (Array.isArray(fieldValue)) {
				return fieldValue.map(val => (isRelationField ? val.id : val));
			} else {
				return isRelationField ? fieldValue.id : fieldValue;
			}
		};

		const fields = type.fields.reduce(function(r, field) {
			if (!['id', 'createdAt', 'updatedAt'].includes(field.name)) {
				const isRelationField = field.args.length > 0;
				r.push({
					name: field.name,
					type: getFieldKind(field),
					listType: getListFieldKind(field),
					isRequired: isFieldRequired(field),
					isRelationField,
					value:
						getEditValue(field.name, isRelationField) || (getFieldKind(field) === 'LIST' ? [] : ''),
					error: null,
				});
			}
			return r;
		}, []);

		this.state = {
			isEdit: !!editData,
			formData: fields,
		};
	}

	static propTypes = {
		type: PropTypes.object.isRequired,
		id: PropTypes.string,
		editData: PropTypes.object,
		history: PropTypes.shape({
			replace: PropTypes.func.isRequired,
		}).isRequired,
	};

	validateValues = field => {
		if (field.isRequired && (!field.value || field.value === '')) {
			return 'Field is required';
		}
		if (field.type === 'Int' && !Number.isInteger(Number(field.value))) {
			return 'Not a number';
		}
		if (field.type === 'Float' && isNaN(Number(field.value))) {
			return 'Not a float';
		}

		return null;
	};

	onFieldChange = (name, value) => {
		const { formData } = this.state;

		const updatedFormData = formData.map(field => {
			if (field.name === name) {
				field.value = value;
				field.error = this.validateValues(field);
			}

			return field;
		});

		this.setState({ formData: updatedFormData });
	};

	handleSubmit = async (e, sendData) => {
		e.preventDefault();
		const { formData, isEdit } = this.state;
		const {
			history: { replace },
			type,
			id,
		} = this.props;
		const validatedFormData = formData.map(field => {
			field.error = this.validateValues(field);
			return field;
		});
		const isFormValid = validatedFormData.filter(field => field.error).length === 0;

		this.setState({ formData: validatedFormData });

		if (isFormValid) {
			const variables = {};
			variables.data = validatedFormData.reduce((r, field) => {
				if (field.isRelationField) {
					r[field.name] = {
						connect:
							field.type === 'LIST'
								? field.value.map(id => ({ id }))
								: {
										id: field.value,
								  },
					};
				} else {
					switch (field.type) {
						case 'Int':
						case 'Float':
							r[field.name] = Number(field.value);
							break;
						case 'LIST':
							r[field.name] = {
								set: field.value.map(
									v => (['Int', 'Float'].includes(field.listType) ? Number(v) : v),
								),
							};
							break;
						default:
							r[field.name] = field.value;
					}
				}
				return r;
			}, Object.create(null));

			if (isEdit) {
				variables.id = id;
			}

			const { error } = await sendData({ variables });

			if (!error) {
				replace(`/model/${snakeCase(type.name)}`);
			}
		}
	};

	buildField = field => {
		switch (field.type) {
			case 'String':
			case 'Int':
			case 'Float':
				return (
					<Form.Input
						name={field.name}
						placeholder={`Enter ${field.name}`}
						value={field.value}
						invalid={!!field.error}
						feedback={field.error}
						onChange={e => this.onFieldChange(field.name, e.target.value)}
					/>
				);
			case 'DateTime':
				return (
					<Form.DatePicker
						name={field.name}
						value={new Date(field.value)}
						invalid={!!field.error}
						feedback={field.error}
						format="mm/dd/yyyy"
						maxYear={2018}
						minYear={1900}
						monthLabels={[
							'January',
							'February',
							'March',
							'April',
							'May',
							'June',
							'July',
							'August',
							'September',
							'October',
							'November',
							'December',
						]}
						onChange={e => this.onFieldChange(field.name, e.target.value)}
					/>
				);
			case 'Boolean':
				return (
					<Form.Switch
						name={field.name}
						value={field.value}
						invalid={!!field.error}
						feedback={field.error}
						checked={field.value}
						onChange={e => this.onFieldChange(field.name, e.target.checked)}
					/>
				);
			case 'LIST':
				return (
					<TagsInput
						value={field.value}
						className="form-control tags-input"
						onChange={tags => this.onFieldChange(field.name, tags)}
					/>
				);
			default:
				return (
					<Form.Input
						name={field.name}
						placeholder={`Enter ${field.type} ID`}
						value={field.value}
						invalid={!!field.error}
						feedback={field.error}
						onChange={e => this.onFieldChange(field.name, e.target.value)}
					/>
				);
		}
	};

	render() {
		const { type, id, editData } = this.props;
		const { formData, isEdit } = this.state;
		const hasCreatedAt = type.fields.some(field => field.name === 'createdAt');
		const hasUpdatedAt = type.fields.some(field => field.name === 'updatedAt');

		return (
			<Page.Content title={isEdit ? 'Edit' : 'Create'}>
				<Mutation
					mutation={isEdit ? buildUpdateMutation(type) : buildCreateMutation(type)}
					update={(cache, { data }) => {
						if (!isEdit) {
							const dataQuery = buildDataQuery(type);
							const queryVariables = { first: LIMIT, skip: 0 };
							let queryData = cache.readQuery({ query: dataQuery, variables: queryVariables });
							const dataFieldName = getDataQueryName(type);
							const createdFieldName = `create${type.name}`;
							queryData[dataFieldName] = queryData[dataFieldName].concat([data[createdFieldName]]);
							cache.writeQuery({
								query: dataQuery,
								data: queryData,
								variables: queryVariables,
							});
						}
					}}
				>
					{(sendData, { error }) => {
						return (
							<Card>
								{error && <Alert type="danger">Form submission failed</Alert>}
								<form onSubmit={e => this.handleSubmit(e, sendData)}>
									<Card.Body>
										<Grid.Row>
											{isEdit && (
												<Fragment>
													<Grid.Col width={4}>
														<Form.Group label="ID">
															<Form.Input name="id" value={id} disabled />
														</Form.Group>
													</Grid.Col>
													{hasCreatedAt && (
														<Grid.Col width={4}>
															<Form.Group label="Created At">
																<Form.Input name="createdAt" value={editData.createdAt} disabled />
															</Form.Group>
														</Grid.Col>
													)}
													{hasUpdatedAt && (
														<Grid.Col width={4}>
															<Form.Group label="Updated At">
																<Form.Input name="updatedAt" value={editData.updatedAt} disabled />
															</Form.Group>
														</Grid.Col>
													)}
												</Fragment>
											)}
											{formData.map(field => (
												<Grid.Col width={4} key={field.name}>
													<Form.Group label={capitalize(field.name)}>
														{this.buildField(field)}
													</Form.Group>
												</Grid.Col>
											))}
										</Grid.Row>
									</Card.Body>
									<Card.Footer className="text-right">
										<Button type="submit" color="primary">
											Submit
										</Button>
									</Card.Footer>
								</form>
							</Card>
						);
					}}
				</Mutation>
			</Page.Content>
		);
	}
}

export default withRouter(DataForm);
