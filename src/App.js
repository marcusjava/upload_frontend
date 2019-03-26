import React, { Component } from 'react';
import GlobalStyle from './styles/global';
import { Container, Content } from './styles';
import Upload from './components/Upload';
import FileList from './components/FileList';
import { uniqueId } from 'lodash';
import fileSize from 'filesize';
import api from './services/api';

class App extends Component {
	state = {
		uploadedFiles: [],
	};

	async componentDidMount() {
		const response = await api.get('/posts');
		this.setState({
			uploadedFiles: response.data.map(file => ({
				id: file._id,
				name: file.name,
				readableSize: fileSize(file.size),
				preview: file.url,
				uploaded: true,
				url: file.url,
			})),
		});
	}

	componentWillUnmount() {
		this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
	}
	handleUpload = files => {
		const uploadedFiles = files.map(file => ({
			file,
			id: uniqueId(),
			name: file.name,
			readableSize: fileSize(file.size),
			preview: URL.createObjectURL(file),
			progress: 0,
			uploaded: false,
			error: false,
			url: null,
		}));
		this.setState({ uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles) });
		//fazendo upload de cada arquivo
		uploadedFiles.forEach(this.processUpload);
	};

	updateFile = (id, data) => {
		this.setState({
			uploadedFiles: this.state.uploadedFiles.map(file => (id === file.id ? { ...file, ...data } : file)),
		});
	};

	processUpload = uploadedFile => {
		const data = new FormData();
		data.append('file', uploadedFile.file, uploadedFile.name);
		api.post('/posts', data, {
			onUploadProgress: e => {
				const progress = parseInt(Math.round((e.loaded * 100) / e.total));
				this.updateFile(uploadedFile.id, {
					progress,
				});
			},
		})
			.then(({ data }) => {
				this.updateFile(uploadedFile.id, { uploaded: true, id: data._id, url: data.url });
			})
			.catch(error => this.updateFile(uploadedFile.id, { error: true }));
	};

	handleDelete = async id => {
		await api.delete(`/posts/${id}`);
		this.setState({
			uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id),
		});
	};

	render() {
		const { uploadedFiles } = this.state;
		return (
			<Container>
				<Content>
					<Upload onUpload={this.handleUpload} />
					{!!uploadedFiles.length && <FileList files={uploadedFiles} onDelete={this.handleDelete} />}
				</Content>
				<GlobalStyle />
			</Container>
		);
	}
}

export default App;
