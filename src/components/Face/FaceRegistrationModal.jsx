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
      const img = new Image();
      img.src = capturedImage;

      img.onload = async () => {
        try {
          const detections = await faceapi.detectAllFaces(
            img,
            new faceapi.TinyFaceDetectorOptions()
          )
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

          const faceDescriptor = detections[0].descriptor;

          const response = await apiCall(API_CONFIG.ENDPOINTS.FACE_DESCRIPTOR, {
            method: 'POST',
            body: JSON.stringify({
              user_id: userId,
              face_descriptor: Array.from(faceDescriptor)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Face Registration
            <span className="block text-sm font-normal text-gray-500">
              {userName}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Status Messages */}
        <div className="px-6 pt-4 text-center text-sm">
          {message && <p className="text-emerald-600">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

        {/* Camera / Preview */}
        <div className="p-6 flex flex-col items-center">
          {!capturedImage ? (
            <>
              <div className="relative mb-5">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md rounded-xl border border-gray-200 shadow-sm"
                />
              </div>

              <button
                onClick={captureImage}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium
                           hover:bg-slate-800 transition disabled:opacity-50"
              >
                Capture Image
              </button>
            </>
          ) : (
            <>
              <div className="mb-5">
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full max-w-md rounded-xl border border-gray-200 shadow-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCapturedImage(null)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-amber-100 text-gray-950 border border-amber-400 hover:bg-amber-400 text-sm font-medium
                             hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Retake
                </button>
                <button
                  onClick={registerFace}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-emerald-100 text-emrald-600 border border-emerald-700 text-sm font-medium
                             hover:bg-emerald-700 hover:text-emerald-100 transition disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Face'}
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Instructions */}
        <div className="bg-gray-100 px-6 py-4 text-sm text-gray-950 border-t">
          <p className="font-medium text-gray-900 mb-2">Instructions</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Position your face within the frame</li>
            <li>Ensure good lighting conditions</li>
            <li>Capture a clear frontal photo</li>
            <li>Click “Register Face” to save</li>
          </ul>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationModal;