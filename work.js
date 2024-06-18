import React, { useState, useEffect } from 'react';
import {
	Upload,
	message,
	Layout,
	Modal,
	Input,
	Card,
	List,
	Button,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import './App.css';

const { Header, Content } = Layout;
const { Dragger } = Upload;

function App() {
	const [file, setFile] = useState(null);
	const [fileUrl, setFileUrl] = useState(null);
	const [visible, setVisible] = useState(false);
	const [inputTitle, setInputTitle] = useState('');
	const [keywordInputs, setKeywordInputs] = useState('');
	const [searchTerms, setSearchTerms] = useState([]);
	const [subSearchTermInputs, setSubSearchTermInputs] = useState([]);
	const [subKeywordInputs, setSubKeywordInputs] = useState([]);
	const [results, setResults] = useState([]);
	const [collapsed, setCollapsed] = useState({});

	const defaultLayoutPluginInstance = defaultLayoutPlugin();
	const searchPluginInstance = searchPlugin();
	const { Search } = searchPluginInstance;

	const toggleCollapse = (index) => {
		setCollapsed((prevState) => ({
			...prevState,
			[index]: !prevState[index],
		}));
	};

	const showModal = () => {
		setVisible(true);
	};

	const handleOk = () => {
		const searchTermsJSON = searchTerms.map(
			({ title, keywords, subSearchTerms }) => ({
				title,
				keywords,
				subSearchTerms,
			}),
		);
		console.log(searchTermsJSON);
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const handleTitleChange = (e) => {
		setInputTitle(e.target.value);
	};

	const handleKeywordChange = (index, value) => {
		const newKeywordInputs = [...keywordInputs];
		newKeywordInputs[index] = value;
		setKeywordInputs(newKeywordInputs);
	};

	const handleSubSearchTermChange = (index, value) => {
		const newSubSearchTermInputs = [...subSearchTermInputs];
		newSubSearchTermInputs[index] = value;
		setSubSearchTermInputs(newSubSearchTermInputs);
	};

	const handleSubKeywordChange = (termIndex, subIndex, value) => {
		const newSubKeywordInputs = [...subKeywordInputs];
		if (!newSubKeywordInputs[termIndex]) {
			newSubKeywordInputs[termIndex] = [];
		}
		newSubKeywordInputs[termIndex][subIndex] = value;
		setSubKeywordInputs(newSubKeywordInputs);
	};

	const handleAddTerm = () => {
		setSearchTerms([
			...searchTerms,
			{ title: inputTitle, keywords: [], subSearchTerms: [] },
		]);
		setKeywordInputs([...keywordInputs, '']);
		setSubSearchTermInputs([...subSearchTermInputs, '']);
		setSubKeywordInputs([...subKeywordInputs, []]);
		setInputTitle('');
	};

	const handleAddKeyword = (index) => {
		setSearchTerms((prevSearchTerms) => {
			const updatedTerms = [...prevSearchTerms];
			updatedTerms[index].keywords.push(keywordInputs[index]);
			return updatedTerms;
		});
		const newKeywordInputs = [...keywordInputs];
		newKeywordInputs[index] = '';
		setKeywordInputs(newKeywordInputs);
	};

	const handleAddSubSearchTerm = (index) => {
		setSearchTerms((prevSearchTerms) => {
			const updatedTerms = [...prevSearchTerms];
			updatedTerms[index].subSearchTerms.push({
				title: subSearchTermInputs[index],
				keywords: [],
			});
			return updatedTerms;
		});
		const newSubSearchTermInputs = [...subSearchTermInputs];
		newSubSearchTermInputs[index] = '';
		setSubSearchTermInputs(newSubSearchTermInputs);
		const newSubKeywordInputs = [...subKeywordInputs];
		newSubKeywordInputs[index] = [...(newSubKeywordInputs[index] || []), ''];
		setSubKeywordInputs(newSubKeywordInputs);
	};

	const handleAddSubKeyword = (termIndex, subIndex) => {
		setSearchTerms((prevSearchTerms) => {
			const updatedTerms = [...prevSearchTerms];
			updatedTerms[termIndex].subSearchTerms[subIndex].keywords.push(
				subKeywordInputs[termIndex][subIndex],
			);
			return updatedTerms;
		});
		const newSubKeywordInputs = [...subKeywordInputs];
		newSubKeywordInputs[termIndex][subIndex] = '';
		setSubKeywordInputs(newSubKeywordInputs);
	};

	const handleRemoveTerm = (index) => {
		const updatedTerms = [...searchTerms];
		updatedTerms.splice(index, 1);
		setSearchTerms(updatedTerms);
		const newKeywordInputs = [...keywordInputs];
		newKeywordInputs.splice(index, 1);
		setKeywordInputs(newKeywordInputs);
		const newSubSearchTermInputs = [...subSearchTermInputs];
		newSubSearchTermInputs.splice(index, 1);
		setSubSearchTermInputs(newSubSearchTermInputs);
		const newSubKeywordInputs = [...subKeywordInputs];
		newSubKeywordInputs.splice(index, 1);
		setSubKeywordInputs(newSubKeywordInputs);
	};

	const props = {
		name: 'file',
		multiple: false,
		beforeUpload: (file) => {
			setFile(file);
			setFileUrl(URL.createObjectURL(file));
			return false; // Prevent the default behavior of Upload component
		},
		onChange(info) {
			const { status } = info.file;
			if (status === 'done') {
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {},
	};

	const handleUpload = async () => {
		if (!file) {
			message.error('No file selected for upload.');
			return;
		}

		const formData = new FormData();
		formData.append('pdf_file', file); // Ensure the key matches the FastAPI endpoint parameter
		formData.append('search_terms', JSON.stringify(searchTerms));

		try {
			const response = await axios.post(
				process.env.REACT_APP_BACKEND_PATH + '/process',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			message.success('File uploaded successfully');
			const resultData = JSON.parse(response.data.result);
			setResults(resultData);
			console.log(results);
		} catch (error) {
			message.error('File upload failed');
			console.error(error);
		}
	};

	const ResultsDisplay = ({ results }) => {
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
						<Card
							key={index}
							title={
								<div>
									<span>{searchTerm.toUpperCase()}</span>
									<Button
										type='link'
										onClick={() => toggleCollapse(index)}
										style={{ float: 'right' }}
									>
										{collapsed[index] ? 'Expand' : 'Collapse'}
									</Button>
								</div>
							}
							style={{ marginBottom: '20px', textAlign: 'left' }}
						>
							{!collapsed[index] && (
								<List
									itemLayout='horizontal'
									dataSource={sortedItems} // Use the extracted list
									renderItem={(item) => (
										<List.Item>
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

	useEffect(() => {
		if (fileUrl) {
			const timeoutId = setTimeout(() => {
				searchPluginInstance.search({ keyword: 'warranty' });
			}, 1000);

			return () => clearTimeout(timeoutId);
		}
	}, [fileUrl]);

	return (
		<Layout className='layout'>
			<Header style={{ background: '#fff', textAlign: 'center', padding: 0 }}>
				<h1>File Upload</h1>
			</Header>
			<Content style={{ padding: '50px', textAlign: 'center' }}>
				<Dragger {...props}>
					<p className='ant-upload-drag-icon'>
						<InboxOutlined />
					</p>
					<p className='ant-upload-text'>
						Click or drag file to this area to upload
					</p>
					<p className='ant-upload-hint'>Support for a single file upload.</p>
				</Dragger>
				{file && <p>Selected file: {file.name}</p>}
				<button onClick={handleUpload} style={{ marginTop: '20px' }}>
					Upload File
				</button>
				<button onClick={showModal} style={{ marginLeft: '20px' }}>
					Update Search Terms
				</button>
				<Modal
					title='Update Search Terms'
					open={visible}
					onOk={handleOk}
					onCancel={handleCancel}
				>
					<Input
						placeholder='Enter title'
						value={inputTitle}
						onChange={handleTitleChange}
					/>
					<Button onClick={handleAddTerm}>Add Term</Button>
					<ul>
						{searchTerms.map((term, index) => (
							<li key={index}>
								<strong>Title:</strong> {term.title}
								<Input
									placeholder='Enter keyword'
									value={keywordInputs[index]}
									onChange={(e) => handleKeywordChange(index, e.target.value)}
								/>
								<Button onClick={() => handleAddKeyword(index)}>
									Add Keyword
								</Button>
								<ul>
									{term.keywords.map((keyword, keywordIndex) => (
										<li key={keywordIndex}>{keyword}</li>
									))}
								</ul>
								<Input
									placeholder='Enter sub search term'
									value={subSearchTermInputs[index]}
									onChange={(e) =>
										handleSubSearchTermChange(index, e.target.value)
									}
								/>
								<Button onClick={() => handleAddSubSearchTerm(index)}>
									Add Sub Search Term
								</Button>
								<ul>
									{term.subSearchTerms.map((subTerm, subIndex) => (
										<li key={subIndex}>
											<strong>Sub Title:</strong> {subTerm.title}
											<Input
												placeholder='Enter keyword for sub search term'
												value={subKeywordInputs[index]?.[subIndex] || ''}
												onChange={(e) =>
													handleSubKeywordChange(
														index,
														subIndex,
														e.target.value,
													)
												}
											/>
											<Button
												onClick={() => handleAddSubKeyword(index, subIndex)}
											>
												Add Keyword
											</Button>
											<ul>
												{subTerm.keywords.map((keyword, keywordIndex) => (
													<li key={keywordIndex}>{keyword}</li>
												))}
											</ul>
										</li>
									))}
								</ul>
								<Button onClick={() => handleRemoveTerm(index)}>Remove</Button>
							</li>
						))}
					</ul>
				</Modal>
				{fileUrl && (
					<div>
						<Worker
							workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
						>
							<div style={{ height: '750px' }}>
								<Viewer
									fileUrl={fileUrl}
									plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
								/>
							</div>
						</Worker>
					</div>
				)}
			</Content>
			<ResultsDisplay results={results} />
		</Layout>
	);
}

export default App;
