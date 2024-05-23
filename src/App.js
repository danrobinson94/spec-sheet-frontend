import React, { useState } from 'react';
import { Upload, message, Layout } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

const { Header, Content } = Layout;
const { Dragger } = Upload;

function App() {
	const [file, setFile] = useState(null);

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

		try {
			console.log('ATTEMPT', file);
			const response = await axios.post(
				'https://spec-sheets.vercel.app/process',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			message.success('File uploaded successfully');
			console.log(response.data);
		} catch (error) {
			message.error('File upload failed');
			console.error(error);
		}
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
			</Content>
		</Layout>
	);
}

export default App;
