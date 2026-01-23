import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { apiCall } from '../../config/api';
import API_CONFIG from '../../config/api';

const FaceRegistrationModal = ({ userId, userName, onClose, onRegistrationComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
const MODEL_URL = '/models';

  useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
       await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Error loading face recognition models. Please refresh the page.');
      }
    };
    
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setMessage('Could not access camera. Please check permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      setMessage('Image captured successfully!');
    }
  };

  const registerFace = async () => {
    if (!capturedImage) {
      setMessage('Please capture an image first.');
      return;
    }

    setLoading(true);
    setMessage('Processing face data...');
    setError('');

    try {
      // Process the captured image to extract face descriptor
      const img = new Image();
      img.src = capturedImage;
      
      img.onload = async () => {
        try {
          // Detect face and landmarks
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
          
          if (detections.length === 0) {
            setError('No face detected in the image. Please try again with a clearer photo.');
            setLoading(false);
            return;
          }
          
          if (detections.length > 1) {
            setError('Multiple faces detected. Please ensure only one face is in the frame.');
            setLoading(false);
            return;
          }
          
          // Get the face descriptor (this is what we'll send to backend)
          const faceDescriptor = detections[0].descriptor;
          
          // Send face descriptor to backend
          const response = await apiCall(API_CONFIG.ENDPOINTS.FACE_DESCRIPTOR, {
            method: 'POST',
            body: JSON.stringify({
              user_id: userId, // Pass the user ID for this specific user
              face_descriptor: Array.from(faceDescriptor) // Store only the 128-dimension descriptor array
            })
          });
          
          const data = response.data;
          
          if (response.response.ok && data.success) {
            setMessage(data.message || 'Face descriptor saved successfully!');
            setTimeout(() => {
              onRegistrationComplete();
              onClose();
            }, 1500);
          } else {
            setError(data.message || 'Failed to save face descriptor');
          }
        } catch (err) {
          console.error('Error processing face descriptor:', err);
          setError('Error processing face data: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      
      img.onerror = () => {
        setError('Error loading image for processing');
        setLoading(false);
      };
    } catch (err) {
      console.error('Error loading face-api models:', err);
      setError('Error loading face recognition models');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Face Registration for {userName}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 text-center text-sm text-gray-600">
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col items-center">
          {!capturedImage ? (
            <>
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md border rounded"
                />
              </div>
              <button
                onClick={captureImage}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Capture Image
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <img 
                  src={capturedImage} 
                  alt="Captured face" 
                  className="w-full max-w-md border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCapturedImage(null)}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Retake Photo
                </button>
                <button
                  onClick={registerFace}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Face'}
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>Instructions:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Position your face within the frame</li>
            <li>Ensure good lighting conditions</li>
            <li>Capture a clear frontal photo of your face</li>
            <li>Click "Register Face" to save your face descriptor</li>
          </ul>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationModal;