import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

export default function Home() {
	const [isResultLoading, setIsResultLoading] = useState(false);
	const [isProcessingImage, setIsProcessingImage] = useState(false);
	const [imageUrl, setImageUrl] = useState('');

	const imageRef = useRef();

	const uploadImage = (e) => {
		const { files } = e.target;
		if (files.length > 0) {
			const url = URL.createObjectURL(files[0]);
			setImageUrl(url);
		} else {
			setImageUrl('');
		}
	};

	const processImage = () => {
		setIsProcessingImage(true);

		const imgTensor = tf.browser.fromPixels(imageRef.current);
		imgTensor = imgTensor.resizeBilinear([224, 224]);

		const imgTensorArray = imgTensor.arraySync();

		fetchImage(imgTensorArray);
	};

	const fetchImage = async (imgTensorArray) => {
		setIsProcessingImage(false);
		setIsResultLoading(true);

		const data = {
			signature_name: 'serving_default',
			instances: [imgTensorArray],
		};
		let headers = { 'content-type': 'application/json' };

		let url =
			'https://car-damage-detection1.herokuapp.com/v1/models/car_model:predict';

		console.log(data);

		await axios
			.request({
				url: url,
				method: 'post',
				data: data,
				headers: headers,
			})
			.then((res) => {
				console.log('Response : ', res);
			})
			.catch((err) => {
				console.log('Error : ', err);
			});
	};

	return (
		<div>
			<Head>
				<title>Car Damage Detector - by Pushkal Pandey</title>
			</Head>
			<div className='space-y-8 text-4xl text-center'>
				<h1>Car Damage Detector</h1>
			</div>
			<div className='inputHolder'>
				<input
					type='file'
					accept='image/*'
					capture='camera'
					className='inputUpload'
					onChange={uploadImage}
				></input>
			</div>
			<div className='mainWrappper'>
				<div class='mainContent'>
					<div className='imageHolder'>
						{imageUrl && (
							<img
								src={imageUrl}
								alt='Upload Preview'
								crossOrigin='anonymous'
								ref={imageRef}
							/>
						)}
					</div>
				</div>
				{imageUrl && (
					<button className='btn' onClick={processImage}>
						Detect Damage
					</button>
				)}
			</div>
		</div>
	);
}
