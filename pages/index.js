import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import styled from 'styled-components';

const TargetBox = styled.div`
	position: absolute;
	left: ${({ x }) => x + 'px'};
	top: ${({ y }) => y + 'px'};
	width: ${({ width }) => width + 'px'};
	height: ${({ height }) => height + 'px'};
	border: 4px solid #1ac71a;
	background-color: transparent;
	z-index: 20;
	&::before {
		content: '${({ classType, score }) =>
			`${classType} ${score.toFixed(1)}%`}';
		color: #1ac71a;
		font-weight: 500;
		font-size: 17px;
		position: absolute;
		top: -1.5em;
		left: -5px;
	}
`;

export default function Home() {
	const [isResultLoading, setIsResultLoading] = useState(false);
	const [isProcessingImage, setIsProcessingImage] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const [predictionsReady, setPredictionsReady] = useState(false);

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
		imgTensor = imgTensor.resizeBilinear([640, 640]);

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
				setIsResultLoading(false);

				showDetections(predictions);
			})
			.catch((err) => {
				console.log('Error : ', err);
			});
	};

	const showDetections = (predictions) => {
		setPredictionsReady(true);
		const {
			num_detections,
			detection_scores,
			detection_boxes,
			detection_classes,
		} = predictions;

		if (num_detections > 0) {
			// console.log('Num detections : ', num_detections);
			// console.log('Detection scores : ', detection_scores);
			// console.log('Detection boxes : ', detection_boxes);
			// console.log('Detection classes : ', detection_classes);
		}
	};

	return (
		<div>
			<Head>
				<title>Car Damage Detector - by Pushkal Pandey</title>
			</Head>
			<div className='flex flex-col items-center col-span-4 space-y-8'>
				<div className='items-center justify-center space-y-8 text-4xl text-center'>
					<h1>Car Damage Detector</h1>
				</div>
				<div className='relative flex items-center w-auto h-auto rounded border-y-2 border-x-2 justify-items-center'>
					{imageUrl && (
						<img
							src={imageUrl}
							ref={imageRef}
							height='640'
							width='640'
							alt='Uploaded Umage Preview'
							crossOrigin='anonymous'
						/>
					)}
					{/* {predictionsReady &&
						predictions.map((prediction, idx) => (
							<TargetBox
								key={idx}
								x={prediction.bbox[0]}
								y={prediction.bbox[1]}
								width={prediction.bbox[2]}
								height={prediction.bbox[3]}
								classType={prediction.class}
								score={prediction.score * 100}
							/>
						))} */}
				</div>
				<form>
					<label class='block'>
						<span class='sr-only'>Choose Image</span>
						<input
							type='file'
							accept='image/*'
							class='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
							onChange={uploadImage}
						/>
					</label>
				</form>
				{imageUrl && (
					<button
						onClick={processImage}
						className='px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700'
					>
						{isProcessingImage
							? 'Processing Image'
							: isResultLoading
							? 'Fetching Results'
							: predictionsReady
							? 'Preparing Results'
							: 'Detect Damage'}
					</button>
				)}
			</div>
		</div>
	);
}
