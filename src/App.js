import React, { useState } from 'react';
import { Upload, message, Layout, Modal, Input, Card, List } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Header, Content } = Layout;
const { Dragger } = Upload;

function App() {
	const [file, setFile] = useState(null);
	const [searchTerms, setSearchTerms] = useState([]);
	const [visible, setVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [results, setResults] = useState([]);

	const showModal = () => {
		setVisible(true);
	};

	const handleOk = () => {
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const handleInput = (e) => {
		setInputValue(e.target.value);
	};

	const handleAddTerm = () => {
		// Split inputValue string into separate terms based on comma delimiter
		const newTerms = inputValue.split(',').map((term) => term.trim());

		// Filter out any empty terms
		const validNewTerms = newTerms.filter((term) => term !== '');

		// Add the new terms to the searchTerms array
		setSearchTerms([...searchTerms, ...validNewTerms]);
		setInputValue('');
	};

	const props = {
		name: 'file',
		multiple: false,
		beforeUpload: (file) => {
			setFile(file);
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
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};

	const handleUpload = async () => {
		if (!file) {
			message.error('No file selected for upload.');
			return;
		}

		const formData = new FormData();
		formData.append('pdf_file', file); // Ensure the key matches the FastAPI endpoint parameter
		formData.append('search_terms', searchTerms);
		console.log('SEARCH', searchTerms);

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
			setResults(response.data.result);
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
					const key = Object.keys(result)[0];
					return (
						<Card
							key={index}
							title={`Search Term: ${key}`}
							style={{ marginBottom: '20px', textAlign: 'left' }}
						>
							<List
								dataSource={result[key]}
								renderItem={(item, itemIndex) => (
									<List.Item key={itemIndex}>{item}</List.Item>
								)}
							/>
						</Card>
					);
				})}
			</div>
		);
	};

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
					onOk={handleOk}
					open={visible}
					onCancel={handleCancel}
				>
					<Input
						placeholder='Enter search term'
						value={inputValue}
						onChange={handleInput}
					/>
					<button onClick={handleAddTerm}>Add</button>
					<ul>
						{searchTerms.map((term, index) => (
							<li key={index}>{term}</li>
						))}
					</ul>
				</Modal>
			</Content>
			<ResultsDisplay results={results} />
		</Layout>
	);
}

export default App;
