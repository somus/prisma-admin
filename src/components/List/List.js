import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query, withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isPlainObject from 'lodash.isplainobject';

import { Page, Icon, Grid, Card, Text, Table, Button, Dimmer } from 'tabler-react';
import ListFooter from './ListFooter';

import {
	LIMIT,
	camelCase,
	snakeCase,
	getDataQueryName,
	getConnectionQueryName,
	getInputTypeFields,
	getFieldKind,
	buildDataQuery,
	buildCountQuery,
	buildDeleteMutation,
} from '../../utils';

class List extends Component {
	state = { page: 1 };

	static propTypes = {
		type: PropTypes.object.isRequired,
		match: PropTypes.shape({
			params: PropTypes.shape({
				type: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		client: PropTypes.shape({
			mutate: PropTypes.func.isRequired,
		}).isRequired,
	};

	async componentDidUpdate(prevProps) {
		const {
			match: { params },
		} = this.props;
		if (prevProps.match.params.type !== params.type && !this.state.dataLoading) {
			await this.setState({ page: 1 });
		}
	}

	handleNextPage = () => this.setState({ page: this.state.page + 1 });

	handlePrevPage = () => this.setState({ page: this.state.page - 1 });

	handleLoadPage = page => this.setState({ page });

	deleteData = id => {
		const {
			type,
			client: { mutate },
		} = this.props;
		const { page } = this.state;
		const skip = page === 1 ? 0 : (page - 1) * LIMIT;
		const first = LIMIT;

		mutate({
			mutation: buildDeleteMutation(type),
			variables: { id },
			refetchQueries: [
				{
					query: buildDataQuery(type),
					variables: {
						first,
						skip,
					},
				},
			],
		});
	};

	buildRowContent = (field, value) => {
		switch (getFieldKind(field)) {
			case 'ID':
				return (
					<Text RootComponent="span" muted>
						{value}
					</Text>
				);
			case 'Boolean':
				return value && <Icon prefix="fe" name="check" />;
			case 'String':
				return value;
			case 'DateTime':
				return (
					<Text RootComponent="span" muted>
						{dayjs(value).format('DD MMM YYYY HH:mm')}
					</Text>
				);
			default:
				return isPlainObject(value) ? value.id : value;
		}
	};

	buildTableContent = (fields, data) =>
		data.map(d => {
			const dataRows = [];
			fields.forEach(field => {
				dataRows.push({ content: this.buildRowContent(field, d[field.name]) });
			});

			return [
				...dataRows,
				{
					alignContent: 'right',
					content: (
						<React.Fragment>
							<Link to={`/model/${camelCase(this.props.type.name)}/edit/${d.id}`}>
								<i style={{ color: '#495057' }} className="fe fe-edit" />
							</Link>
							<i className="fe fe-trash ml-2" onClick={() => this.deleteData(d.id)} />
						</React.Fragment>
					),
				},
			];
		});

	render() {
		const {
			type,
			match: { params },
		} = this.props;
		const { page } = this.state;
		const fields = getInputTypeFields(type);
		const skip = page === 1 ? 0 : (page - 1) * LIMIT;
		const first = LIMIT;

		return (
			<Page.Content title={type.name}>
				<Grid.Row>
					<Grid.Col width={12}>
						<Query query={buildCountQuery(type)}>
							{({ loading, data }) => {
								const countFieldName = getConnectionQueryName(type);
								const total = data[countFieldName] ? data[countFieldName].aggregate.count : 0;

								if (loading) return <Dimmer active loader />;

								return (
									<Card>
										<Card.Header>
											<Card.Options>
												<Button
													color="primary"
													size="sm"
													className="cardActionButton"
													RootComponent={Link}
													to={`/model/${params.type}/create`}
												>
													Add
												</Button>
											</Card.Options>
										</Card.Header>
										<Card.Body className="of-a">
											<Query query={buildDataQuery(type)} variables={{ first, skip }}>
												{({ loading, data }) => {
													const dataFieldName = getDataQueryName(type);
													const dataArray = data[dataFieldName];

													if (loading) return <Dimmer active loader />;

													return (
														<Table
															responsive
															cards
															className="table-vcenter"
															headerItems={[
																...fields.map(field => ({
																	content: snakeCase(field.name),
																})),
																{ content: null, className: 'w-1' },
															]}
															bodyItems={this.buildTableContent(fields, dataArray)}
														/>
													);
												}}
											</Query>
										</Card.Body>
										<ListFooter
											total={total}
											page={page}
											handleNextPage={this.handleNextPage}
											handlePrevPage={this.handlePrevPage}
											handleLoadPage={this.handleLoadPage}
										/>
									</Card>
								);
							}}
						</Query>
					</Grid.Col>
				</Grid.Row>
			</Page.Content>
		);
	}
}

export default withApollo(List);
