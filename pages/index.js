import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import styled from 'styled-components';

const ObjectDetectorContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const DetectorContainer = styled.div`
	min-width: 200px;
	height: 700px;
	border: 3px solid #fff;
	border-radius: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
`;

const TargetImg = styled.img`
	height: 100%;
`;

const HiddenFileInput = styled.input`
	display: none;
`;

const SelectButton = styled.button`
	padding: 7px 10px;
	border: 2px solid transparent;
	background-color: #fff;
	color: #0a0f22;
	font-size: 16px;
	font-weight: 500;
	outline: none;
	margin-top: 2em;
	cursor: pointer;
	transition: all 260ms ease-in-out;
	&:hover {
		background-color: transparent;
		border: 2px solid #fff;
		color: #fff;
	}
`;

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
				setIsResultLoading(false);

				showDetections(predictions);
			})
			.catch((err) => {
				console.log('Error : ', err);
			});
	};

	const showDetections = (predictions) => {
		if (predictions.length > 0) {
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
		}
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
