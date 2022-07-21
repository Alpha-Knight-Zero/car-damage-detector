import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
	const [isResultLoading, setIsResultLoading] = useState(false);
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
				{imageUrl && <button className='button'>Detect Damage</button>}
			</div>
		</div>
	);
}
