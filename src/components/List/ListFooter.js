import React from 'react';
import PropTypes from 'prop-types';

import { Card } from 'tabler-react';

import { LIMIT } from '../../utils';

const ListFooter = ({ total, page, handleNextPage, handlePrevPage, handleLoadPage }) => {
	const totalPages = Math.ceil(total / LIMIT);

	return (
		<Card.Footer>
			{total !== 0 && (
				<div className="d-flex">
					<div className="page-total-text" style={{ marginRight: 'auto' }}>
						{(page - 1) * LIMIT + 1} - {page * LIMIT > total ? total : page * LIMIT} of {total}{' '}
						items
					</div>
					<ul className="pagination">
						<li className={`page-item page-prev${page === 1 ? ' disabled' : ''}`}>
							<button
								className="page-link"
								tabIndex="-1"
								disabled={page === 1}
								onClick={handlePrevPage}
							>
								Prev
							</button>
						</li>
						{Array.from({ length: totalPages }, (v, k) => k + 1).map(p => (
							<li key={p} className={`page-item${p === page ? ' active' : ''}`}>
								<button
									className="page-link"
									tabIndex={p}
									disabled={p === page}
									onClick={() => handleLoadPage(p)}
								>
									{p}
								</button>
							</li>
						))}
						<li className={`page-item page-next${page === totalPages ? ' disabled' : ''}`}>
							<button className="page-link" disabled={page === totalPages} onClick={handleNextPage}>
								Next
							</button>
						</li>
					</ul>
				</div>
			)}
		</Card.Footer>
	);
};

ListFooter.propTypes = {
	total: PropTypes.number.isRequired,
	page: PropTypes.number.isRequired,
	handleNextPage: PropTypes.func.isRequired,
	handlePrevPage: PropTypes.func.isRequired,
	handleLoadPage: PropTypes.func.isRequired,
};

export default ListFooter;
