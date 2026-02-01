import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as faceapi from 'face-api.js';
import API_CONFIG, { apiCall } from '../../config/api';
import { FaCheck, FaTimes } from 'react-icons/fa';

const MODEL_URL = '/models';

export default function FaceAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [detectedPerson, setDetectedPerson] = useState(null);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [punchType, setPunchType] = useState(null); // 'in' or 'out'
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({ punchIn: null, punchOut: null });
  const { user } = useAuth();

  useEffect(() => {
    // Load models on component mount
    const loadModels = async () => {
      try {
        // Load the face-api models - using the correct names that match the manifest files
        // Load models individually to catch specific errors
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          console.log('Tiny face detector loaded successfully');
        } catch (error) {
          console.error('Error loading tiny face detector:', error);
          setError('Failed to load face detection model. Please refresh the page.');
          return; // Stop if critical model fails
        }
        
        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          console.log('Face landmark 68 net loaded successfully');
        } catch (error) {
          console.error('Error loading face landmark 68 net:', error);
          setError('Failed to load face landmark model. Please refresh the page.');
          return; // Stop if critical model fails
        }
        
        try {
          await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
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
    
    // Request camera access when component mounts
    startCamera();
    
    // Start the recognition loop when component mounts
    startRecognition();
    
    return () => {
      // Clean up camera stream when component unmounts
      stopRecognition();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const recognizeFace = async (faceDescriptor) => {
    try {
      // Send face descriptor to backend for recognition
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.ATTENDANCE_MARK, {
        method: 'POST',
        body: JSON.stringify({
          face_descriptor: Array.from(faceDescriptor) // Convert Float32Array to regular array
        })
      });
      
      if (response.ok && data.success) {
        return data.data; // Return the matched user data
      } else {
        // Store the error data for better UI feedback
        return { error: data.message, distance: data.distance, threshold: data.threshold };
      }
    } catch (err) {
      console.error('Error recognizing face:', err);
      return null;
    }
  };
  
  const verifyAttendance = async (faceDescriptor) => {
    try {
      // Send face descriptor to backend for recognition
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.ATTENDANCE_MARK, {
        method: 'POST',
        body: JSON.stringify({
          face_descriptor: Array.from(faceDescriptor) // Convert Float32Array to regular array
        })
      });
      
      if (response.ok && data.success) {
        return data.data; // Return the matched user data
      } else {
        return null; // No match found
      }
    } catch (err) {
      console.error('Error verifying face:', err);
      return null;
    }
  };

  const startRecognition = async () => {
    if (!videoRef.current) {
      setError('Camera not available');
      return;
    }
    
    setRecognitionActive(true);
    
    const recognizeLoop = async () => {
      if (!recognitionActive) return;
      
      try {
        // Detect face in the current video frame
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        if (detections.length > 0) {
          if (detections.length > 1) {
            // Multiple faces detected, show a warning
            setDetectedPerson({ name: 'Multiple faces detected', multiple: true });
          } else {
            // Single face detected, try to recognize it
            const faceDescriptor = detections[0].descriptor;
            const recognitionResult = await recognizeFace(faceDescriptor);
            
            if (recognitionResult && !recognitionResult.error) {
              setDetectedPerson({
                name: recognitionResult.user.name,
                email: recognitionResult.user.email,
                confidence: recognitionResult.confidence,
                distance: recognitionResult.distance
              });
            } else {
              // Face detected but not recognized properly
              let message = 'Face not registered in system';
              if (recognitionResult && recognitionResult.distance !== undefined) {
                if (recognitionResult.distance >= 0.5) { // Changed from 0.6 to 0.5
                  message = `Confidence too low (${Math.round((1 - recognitionResult.distance) * 100)}%)`;
                }
              }
              setDetectedPerson({ name: 'Face Detected', unknown: true, message: message });
            }
          }
        } else {
          // No face detected
          setDetectedPerson(null);
        }
      } catch (err) {
        console.error('Error in recognition loop:', err);
      }
      
      // Schedule the next recognition after a delay
      setTimeout(recognizeLoop, 500); // Adjust this interval as needed
    };
    
    // Start the recognition loop
    recognizeLoop();
  };
  
  const stopRecognition = () => {
    setRecognitionActive(false);
    setDetectedPerson(null);
  };
  
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

  const initiatePunch = async (type) => {
    setPunchType(type);
    
    if (!videoRef.current) {
      setError('Camera not available');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setAttendanceResult(null);

    try {
      // Detect face in the current video frame
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length === 0) {
        setError('No face detected. Please position yourself in front of the camera.');
        setLoading(false);
        return;
      }
      
      if (detections.length > 1) {
        setError('Multiple faces detected. Please ensure only your face is in the frame.');
        setLoading(false);
        return;
      }
      
      // Get the face descriptor
      const faceDescriptor = detections[0].descriptor;
      
      // Verify the face first
      const verificationResult = await verifyAttendance(faceDescriptor);
      
      if (verificationResult) {
        // Show verification dialog
        setVerificationData({
          user: verificationResult.user,
          confidence: verificationResult.confidence,
          distance: verificationResult.distance,
          punchType: type
        });
        setShowVerificationDialog(true);
      } else {
        // Show more specific error message based on the response
        if (data && data.distance !== undefined) {
          if (data.distance >= 0.5) { // Changed from 0.6 to 0.5
            setError(`Face detected but confidence too low (${Math.round((1 - data.distance) * 100)}%). Please try again or register your face.`);
          } else {
            setError('Face not recognized. Please ensure your face is registered in the system.');
          }
        } else {
          setError('Face not recognized. Please register your face first or try again.');
        }
      }
    } catch (err) {
      console.error('Error during punch in/out:', err);
      setError('Error processing face recognition: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmAttendance = async () => {
    if (!verificationData) {
      setError('No verification data available');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, you would send a request to mark punch in/out
      // For now, we'll just simulate the action
      setMessage(`Punch ${verificationData.punchType} recorded for ${verificationData.user.name}!`);
      
      // Update attendance status
      if (verificationData.punchType === 'in') {
        setAttendanceStatus(prev => ({
          ...prev,
          punchIn: new Date().toLocaleTimeString()
        }));
      } else {
        setAttendanceStatus(prev => ({
          ...prev,
          punchOut: new Date().toLocaleTimeString()
        }));
      }
      
      setAttendanceResult({
        ...verificationData,
        punchType: verificationData.punchType
      });
    } catch (err) {
      console.error('Error confirming attendance:', err);
      setError('Error confirming attendance: ' + err.message);
    } finally {
      setLoading(false);
      setShowVerificationDialog(false);
      setVerificationData(null);
    }
  };
  
  const cancelAttendance = () => {
    setShowVerificationDialog(false);
    setVerificationData(null);
    setPunchType(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Attendance</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Punch In / Punch Out</h2>
                
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
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => initiatePunch('in')}
                    disabled={loading}
                    className={`flex-1 py-3 rounded transition font-medium flex items-center justify-center ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {/* <FaClockIn className="mr-2" /> */}
                    {loading ? 'Processing...' : 'Punch In'}
                  </button>
                  <button
                    onClick={() => initiatePunch('out')}
                    disabled={loading}
                    className={`flex-1 py-3 rounded transition font-medium flex items-center justify-center ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {/* <FaClockOut className="mr-2" /> */}
                    {loading ? 'Processing...' : 'Punch Out'}
                  </button>
                </div>
                
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={recognitionActive ? stopRecognition : startRecognition}
                    className={`flex-1 py-2 rounded transition font-medium ${
                      recognitionActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {recognitionActive ? 'Stop Recognition' : 'Start Recognition'}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 mt-2">
                  {recognitionActive ? (
                    <p>Status: Real-time recognition active</p>
                  ) : (
                    <p>Status: Recognition paused</p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Position your face within the frame</li>
                  <li>• Ensure good lighting on your face</li>
                  <li>• Look directly at the camera</li>
                  <li>• Keep a neutral expression</li>
                  <li>• Click "Punch In" or "Punch Out" when ready</li>
                </ul>
              </div>
            </div>
            
            {/* Result Section */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Attendance Status</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-green-800 font-medium">Punch In: {attendanceStatus.punchIn || 'Not recorded'}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-red-800 font-medium">Punch Out: {attendanceStatus.punchOut || 'Not recorded'}</p>
                  </div>
                </div>
                
                {message && (
                  <div className="p-4 bg-green-100 text-green-700 rounded-lg mb-4">
                    {message}
                  </div>
                )}
                
                {error && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                {detectedPerson && (
                  <div className={`bg-white p-4 rounded-lg border ${detectedPerson.unknown ? 'border-red-200' : detectedPerson.multiple ? 'border-yellow-200' : 'border-green-200'}`}>
                    <h3 className="font-semibold mb-2">
                      {detectedPerson.multiple ? 'Multiple Faces Detected!' : 
                       detectedPerson.unknown ? 'Unknown Person' : 
                       'Recognized User'}
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {detectedPerson.name}</p>
                      {detectedPerson.email && (
                        <p><span className="font-medium">Email:</span> {detectedPerson.email}</p>
                      )}
                      {detectedPerson.confidence && (
                        <p><span className="font-medium">Confidence:</span> {detectedPerson.confidence}%</p>
                      )}
                      {detectedPerson.distance && (
                        <p><span className="font-medium">Match Distance:</span> {detectedPerson.distance}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {attendanceResult && (
                  <div className="bg-white p-4 rounded-lg border border-green-200 mt-4">
                    <h3 className="font-semibold text-green-800 mb-2">Attendance Confirmed!</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {attendanceResult.user.name}</p>
                      <p><span className="font-medium">Email:</span> {attendanceResult.user.email}</p>
                      <p><span className="font-medium">Punch Type:</span> {attendanceResult.punchType}</p>
                      <p><span className="font-medium">Confidence:</span> {attendanceResult.confidence}%</p>
                      <p><span className="font-medium">Match Distance:</span> {attendanceResult.distance}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-2">How It Works:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 text-indigo-800 rounded-full p-2 mr-3">
                        <span className="font-bold">1</span>
                      </div>
                      <p className="text-gray-600">Position your face in front of the camera</p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-indigo-100 text-indigo-800 rounded-full p-2 mr-3">
                        <span className="font-bold">2</span>
                      </div>
                      <p className="text-gray-600">Click "Punch In" or "Punch Out" button</p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-indigo-100 text-indigo-800 rounded-full p-2 mr-3">
                        <span className="font-bold">3</span>
                      </div>
                      <p className="text-gray-600">Verify your identity in the confirmation dialog</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {user && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">Your Profile</h3>
                  <p className="text-sm text-purple-700">
                    <span className="font-medium">Logged in as:</span> {user.name} ({user.email})
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    <span className="font-medium">Role:</span> {user.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Dialog */}
      {showVerificationDialog && verificationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Verify Attendance</h3>
            
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Employee Information</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {verificationData.user.name}</p>
                  <p><span className="font-medium">Employee ID:</span> {verificationData.user.id}</p>
                  <p><span className="font-medium">Punch Type:</span> {verificationData.punchType.toUpperCase()}</p>
                  <p><span className="font-medium">Confidence:</span> {verificationData.confidence}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmAttendance}
                disabled={loading}
                className={`flex-1 py-3 rounded transition font-medium flex items-center justify-center bg-green-600 hover:bg-green-700 text-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCheck className="mr-2" />
                Confirm
              </button>
              <button
                onClick={cancelAttendance}
                disabled={loading}
                className={`flex-1 py-3 rounded transition font-medium flex items-center justify-center bg-red-600 hover:bg-red-700 text-white ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaTimes className="mr-2" />
                Retake
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}