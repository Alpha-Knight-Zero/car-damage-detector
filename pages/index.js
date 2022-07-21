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

		await axios
			.request({
				url: url,
				method: 'post',
				data: data,
				headers: headers,
			})
			.then((res) => {
				const predictions = res.data.predictions[0];

				showDetections(predictions);
			})
			.catch((err) => {
				console.log('Error : ', err);
			});
	};

	const showDetections = (predictions) => {
		const {
			num_detections,
			detection_scores,
			detection_boxes,
			detection_classes,
		} = predictions;

		// console.log('Num detections : ', num_detections);
		// console.log('Detection scores : ', detection_scores);
		// console.log('Detection boxes : ', detection_boxes);
		// console.log('Detection classes : ', detection_classes);
		
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
					<div className='flex col-span-4 imageHolder'>
						<div>
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
				</div>
				{imageUrl && (
					<button
						className='px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700'
						onClick={processImage}
					>
						Detect Damage
					</button>
				)}
			</div>
		</div>
	);
}
