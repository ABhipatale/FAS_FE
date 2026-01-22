import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as faceapi from 'face-api.js';

export default function FaceRegistration() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Request camera access when component mounts
    startCamera();
    
    return () => {
      // Clean up camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const saveFaceDescriptor = async () => {
    if (!capturedImage) {
      setError('Please capture a face photo first');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Convert captured image to HTML Image element
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
          
          // Get the face descriptor (this is what we'll save)
          const faceDescriptor = detections[0].descriptor;
          
          // Send face descriptor to backend
          const response = await fetch('http://localhost:8000/api/face-descriptor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              face_descriptor: Array.from(faceDescriptor) // Store only the 128-dimension descriptor array as required
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            setMessage(data.message || 'Face descriptor saved successfully!');
            setTimeout(() => {
              // Optionally redirect or clear the form
              setCapturedImage(null);
            }, 2000);
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

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load the face-api models - using the correct names that match the manifest files
        // Load models individually to catch specific errors
        // Note: The face recognition model is large and may take longer to load
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model');
          console.log('Tiny face detector loaded successfully');
        } catch (error) {
          console.error('Error loading tiny face detector:', error);
          setError('Failed to load face detection model. Please refresh the page.');
          return; // Stop if critical model fails
        }
        
        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model');
          console.log('Face landmark 68 net loaded successfully');
        } catch (error) {
          console.error('Error loading face landmark 68 net:', error);
          setError('Failed to load face landmark model. Please refresh the page.');
          return; // Stop if critical model fails
        }
        
        try {
          await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition_model');
          console.log('Face recognition net loaded successfully');
        } catch (error) {
          console.error('Error loading face recognition net:', error);
          setError('Failed to load face recognition model. Please refresh the page.');
          return; // Stop if critical model fails
        }
        console.log('Face-api models loaded successfully');
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Error loading face recognition models. Please try refreshing the page.');
      }
    };
    
    loadModels();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Registration</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Capture Your Face</h2>
                
                {!capturedImage ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-white rounded-full w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                          <div className="border-2 border-white rounded-full w-40 h-40 md:w-56 md:h-56"></div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={captureFace}
                      className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-medium"
                    >
                      Capture Face
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black rounded overflow-hidden">
                      <img 
                        src={capturedImage} 
                        alt="Captured face" 
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={retakePhoto}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                      >
                        Retake Photo
                      </button>
                      
                      <button
                        onClick={saveFaceDescriptor}
                        disabled={loading}
                        className={`flex-1 py-2 rounded transition ${
                          loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {loading ? 'Saving...' : 'Save Face'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Position your face within the frame</li>
                  <li>• Ensure good lighting on your face</li>
                  <li>• Look directly at the camera</li>
                  <li>• Keep a neutral expression</li>
                  <li>• Click "Capture Face" when ready</li>
                </ul>
              </div>
            </div>
            
            {/* Info Section */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">About Face Registration</h2>
                <p className="text-gray-600 mb-4">
                  Face registration allows the system to recognize you for attendance tracking. 
                  Your face data is securely stored and used only for identification purposes.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Your face data is encrypted and securely stored</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Face recognition happens locally when clocking in</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Your privacy is protected - no photos are stored as images</p>
                  </div>
                </div>
              </div>
              
              {message && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden canvas for capturing image */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}