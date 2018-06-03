import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query, withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isPlainObject from 'lodash.isplainobject';

import { Page, Icon, Card, Text, Table, Button, Dimmer, Alert } from 'tabler-react';
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
		data.map((d, i) => {
			return (
				<Table.Row key={i}>
					{fields.map(field => (
						<Table.Col key={field.name}>{this.buildRowContent(field, d[field.name])}</Table.Col>
					))}
					<Table.Col alignContent="right">
						<Link to={`/model/${camelCase(this.props.type.name)}/edit/${d.id}`}>
							<i style={{ color: '#495057' }} className="fe fe-edit" />
						</Link>
						<i className="fe fe-trash ml-2" onClick={() => this.deleteData(d.id)} />
					</Table.Col>
				</Table.Row>
			);
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
				<Query query={buildCountQuery(type)}>
					{({ loading, data }) => {
						const countFieldName = getConnectionQueryName(type);
						const total = data && data[countFieldName] ? data[countFieldName].aggregate.count : 0;

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
										{({ loading, data, error }) => {
											if (loading) return <Dimmer active loader />;

											const dataFieldName = getDataQueryName(type);
											const dataArray = data ? data[dataFieldName] : [];

											return (
												<React.Fragment>
													{(error || !data) && <Alert type="danger">Data loading failed</Alert>}
													<Table responsive cards className="table-vcenter">
														<Table.Header>
															<Table.Row>
																{fields.map(field => (
																	<Table.ColHeader key={field.name}>
																		{snakeCase(field.name)}
																	</Table.ColHeader>
																))}
																<Table.ColHeader className="w-1">Action</Table.ColHeader>
															</Table.Row>
														</Table.Header>
														<Table.Body>{this.buildTableContent(fields, dataArray)}</Table.Body>
													</Table>
													{dataArray.length === 0 && <p className="text-center my-2">No data</p>}
												</React.Fragment>
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
			</Page.Content>
		);
	}
}

export default withApollo(List);
