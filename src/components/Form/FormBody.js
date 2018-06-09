import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Form, Tooltip } from 'tabler-react';
import TagsInput from 'react-tagsinput';
import AutosizeInput from 'react-input-autosize';

import 'react-tagsinput/react-tagsinput.css';

import { capitalize } from '../../utils';

const buildField = (field, isEdit, onFieldChange) => {
	const isRelationFieldWithoutId =
		field.isRelationField && field.primaryRelationField.name !== 'id';
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
					onChange={e => onFieldChange(field.name, e.target.value)}
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
					onChange={e => onFieldChange(field.name, e.target.value)}
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
					onChange={e => onFieldChange(field.name, e.target.checked)}
				/>
			);
		case 'LIST':
			return (
				<TagsInput
					value={field.value}
					className="form-control tags-input"
					inputProps={{
						placeholder: `Enter ${field.listType} ${
							field.primaryRelationField.name
						} and press enter`,
					}}
					renderInput={({ addTag, ...props }) => {
						let { onChange, value, ...other } = props;
						return <AutosizeInput type="text" onChange={onChange} value={value} {...other} />;
					}}
					// It's not possible to edit related fields without id
					disabled={isEdit && isRelationFieldWithoutId}
					onChange={tags => onFieldChange(field.name, tags)}
				/>
			);
		case 'ENUM':
			return (
				<Form.Select
					name={field.name}
					value={field.value}
					onChange={e => onFieldChange(field.name, e.target.value)}
				>
					{field.enumValues.map(v => (
						<option key={v} value={v}>
							{v}
						</option>
					))}
				</Form.Select>
			);
		default:
			return (
				<Form.Input
					name={field.name}
					placeholder={`Enter ${field.type} ${field.primaryRelationField.name}`}
					value={field.value}
					invalid={!!field.error}
					feedback={field.error}
					// It's not possible to edit related fields without id
					disabled={isEdit && isRelationFieldWithoutId}
					onChange={e => onFieldChange(field.name, e.target.value)}
				/>
			);
	}
};

const buildLabel = (field, isEdit) => {
	const isRelationFieldWithoutId =
		field.isRelationField && field.primaryRelationField.name !== 'id';

	return (
		<Form.Label
			aside={
				isEdit && isRelationFieldWithoutId ? (
					<Tooltip content="test" placement="top">
						<i className="fe fe-info" />
					</Tooltip>
				) : (
					''
				)
			}
		>
			{capitalize(field.name)}
			{field.isRequired && <span className="form-required">*</span>}
		</Form.Label>
	);
};

const FormBody = ({ formData, isEdit, onFieldChange }) => {
	return formData.map(field => (
		<Grid.Col width={4} key={field.name}>
			<Form.Group label={buildLabel(field, isEdit)} isRequired={field.isRequired}>
				{buildField(field, isEdit, onFieldChange)}
			</Form.Group>
		</Grid.Col>
	));
};

FormBody.propTypes = {
	formData: PropTypes.array.isRequired,
	isEdit: PropTypes.bool.isRequired,
	onFieldChange: PropTypes.func.isRequired,
};

export default FormBody;
