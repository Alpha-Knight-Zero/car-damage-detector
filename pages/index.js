import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import styled from 'styled-components';
import Image from 'next/image';
import { minimum } from '@tensorflow/tfjs';

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
			`${classType} ${score.toFixed(2)}%`}';
		color: #58cd36;
		font-weight: 500;
		font-size: 27px;
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

	const [preds, setPreds] = useState([]);

	const classLabels = {
		1: 'Scratch',
		2: 'Dent',
		3: 'Replacement',
		4: 'Broken Glass',
	};

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
		//change type to uint8
		imgTensor = imgTensor.toInt();
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
			'https://cors-proxy-flask.herokuapp.com/predict';

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
		setIsResultLoading(false);
		setPredictionsReady(true);

		const {
			num_detections,
			detection_scores,
			detection_boxes,
			detection_classes,
		} = predictions;

		const scores = [];

		if (num_detections > 0) {
			const predss = [];

			for (let i = 0; i < num_detections; i++) {
				scores.push([detection_scores[i], i]);

				const ymin = detection_boxes[i][0];
				const xmin = detection_boxes[i][1];
				const ymax = detection_boxes[i][2];
				const xmax = detection_boxes[i][3];

				//normalizing coordinates to fit the image
				const x = xmin * imageRef.current.width;
				const width = xmax * imageRef.current.width - x;
				const y = ymin * imageRef.current.height;
				const height = ymax * imageRef.current.height - y;

				const classType = detection_classes[i];
				const score = detection_scores[i];

				predss.push({ x, y, width, height, classType, score });
			}

			scores.sort((a, b) => b[0] - a[0]);

			const predsss = [];
			for (let i = 0; i < Math.min(2, predss.length); i++) {
				if (scores[i][0] > 0.195) {
					predsss.push(predss[scores[i][1]]);
				}
			}

			setPreds(predsss);
		}
	};

	const clearSlate = () => {
		setPreds([]);
		setImageUrl('');
		setIsProcessingImage(false);
		setPredictionsReady(false);
		setIsResultLoading(false);
		imageRef = null;
	};

	return (
		<div>
			<Head>
				<title>Car Damage Detector - by Pushkal Pandey</title>
					<meta
						name='description'
						content="A free website managed by Pushkal Pandey (IIIT Pune 2020-2024) that can detect and classify 4 types of car damages on a picture of a car."
						/>
					<meta
						name='keywords'
						content='Pushkal Pandey,Web development,fullstack,IIIT Pune , Pushkal ,Pandey , car damage detection ,car damage classification , AI car damage , car damage machine learning,car damage deep learning,free car damage detection, free'
					 '
					/>
					<meta 
						name="google-site-verification" 
						content="Mo84Ww3PrAZSxGRrtPvkl4DnOeOTmYQB7HBgUehR5lM" 
					/>
			</Head>
			<div className='flex flex-col items-center col-span-4 space-y-8'>
				<div>
					<nav className='bg-white rounded shadow dark:bg-gray-800'>
						<div className='px-8 mx-auto max-w-7xl'>
							<div className='flex items-center justify-between h-16'>
								<div className='flex items-center '>
									<div className='hidden md:block'>
										<div className='flex items-baseline space-x-4'>
											<a
												className='px-3 py-2 text-4xl text-gray-300 rounded-md font-edium hover:text-gray-800 dark:hover:text-white'
												href='/#'
											>
												Car Damage Detector
											</a>
										</div>
									</div>
								</div>
								<div className='block'>
									<div className='flex items-center ml-4 md:ml-6'>
										<a
											href='https://github.com/Alpha-Knight-Zero/car-damage-detector'
											className='p-1 text-gray-400 rounded-full focus:outline-none hover:text-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
											target='_blank'
										>
											<span className='sr-only'>
												View Project Github
											</span>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='30'
												height='30'
												fill='currentColor'
												className='text-xl transition-colors duration-200 hover:text-gray-800 dark:hover:text-white'
												viewBox='0 0 1792 1792'
											>
												<path d='M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z'></path>
											</svg>
										</a>
										<a
											href='https://portfolio-three-weld.vercel.app/'
											className='p-1 text-gray-400 rounded-full focus:outline-none hover:text-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
											target='_blank'
										>
											<span className='sr-only'>
												View Pushkal's Portfolio
											</span>
											<Image
												src='/dp.jpeg'
												height={30}
												width={30}
												className='text-xl transition-colors duration-200 rounded-full hover:text-gray-800 dark:hover:text-white'
											/>
										</a>
									</div>
								</div>
							</div>
						</div>
					</nav>
				</div>
				<div className='flex justify-end space-x-10'>
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
								? 'Showing Predictions'
								: 'Detect Damage'}
						</button>
					)}
					<button
						onClick={clearSlate}
						className='px-4 py-2 font-bold text-white bg-red-500 rounded-full hover:bg-red-700'
					>
						Clear
					</button>
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
					{predictionsReady &&
						preds.map((pred, idx) => (
							<TargetBox
								key={idx}
								x={pred.x}
								y={pred.y}
								width={pred.width}
								height={pred.height}
								classType={classLabels[pred.classType]}
								score={pred.score * 100}
							/>
						))}
				</div>
				<form>
					<label className='block'>
						<span className='sr-only'>Choose Image</span>
						<input
							type='file'
							accept='image/*'
							className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
							onChange={uploadImage}
						/>
					</label>
				</form>
			</div>
		</div>
	);
}
