import React from 'react';
import { Card, List, Button } from 'antd';

const ResultsDisplay = ({
	results,
	collapsed,
	toggleCollapse,
	handleCardClick,
}) => {
	if (!Array.isArray(results)) {
		return null;
	}

	return (
		<div>
			{results.map((result, index) => {
				const searchTerm = result[0]['title']; // Extract the search term
				const items = result; // Extract the list of header-value pairs
				if (!Array.isArray(result)) {
					console.error(
						`Expected array but got ${typeof items} for search term ${searchTerm}`,
					);
					return null;
				}
				const sortedItems = items.slice().sort((a, b) => {
					if (a.title < b.title) return -1;
					if (a.title > b.title) return 1;
					return 0;
				});

				return (
					<Card key={index} style={{ marginBottom: '20px', textAlign: 'left' }}>
						<div>
							<span>{searchTerm.toUpperCase()}</span>
							<Button
								type='link'
								onClick={(e) => {
									e.stopPropagation(); // Prevents the card's onClick from triggering
									toggleCollapse(index);
								}}
								style={{ float: 'right' }}
							>
								{collapsed[index] ? 'Expand' : 'Collapse'}
							</Button>
						</div>
						{!collapsed[index] && (
							<List
								itemLayout='horizontal'
								dataSource={sortedItems} // Use the extracted list
								renderItem={(item) => (
									<List.Item
										onClick={() => handleCardClick(item)}
										style={{ cursor: 'pointer' }}
									>
										<div>
											<List.Item.Meta
												title={
													<div style={{ whiteSpace: 'pre-wrap' }}>
														<span>{item['title']}</span>
														<br />
														<span>{item['reference']}</span>
													</div>
												}
												description={
													<span
														dangerouslySetInnerHTML={{
															__html: item['value'].replace(
																new RegExp(item['title'], 'gi'),
																`<span style="background-color: yellow;">$&</span>`,
															),
														}}
													/>
												}
											/>
										</div>
									</List.Item>
								)}
							/>
						)}
					</Card>
				);
			})}
		</div>
	);
};

export default ResultsDisplay;
