// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";

// const FaceAttendance = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadModels = async () => {
//       const MODEL_URL = "/models";

//     //   await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
// await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
// await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
// await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
//       startCamera();
//       setLoading(false);
//     };

//     loadModels();
//   }, []);

//   const startCamera = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     videoRef.current.srcObject = stream;
//   };

//   const handleVideoPlay = () => {
//     const interval = setInterval(async () => {
//       if (
//         videoRef.current &&
//         videoRef.current.readyState === 4
//       ) {
//         const detections = await faceapi.detectAllFaces(
//           videoRef.current,
//           new faceapi.TinyFaceDetectorOptions()
//         );

//         const canvas = canvasRef.current;
//         const displaySize = {
//           width: videoRef.current.videoWidth,
//           height: videoRef.current.videoHeight,
//         };

//         faceapi.matchDimensions(canvas, displaySize);
//         const resizedDetections = faceapi.resizeResults(
//           detections,
//           displaySize
//         );

//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         faceapi.draw.drawDetections(canvas, resizedDetections);
//       }
//     }, 300);

//     return () => clearInterval(interval);
//   };

//   return (
//     <div style={{ textAlign: "center" }}>
//       <h2>Face Attendance</h2>

//       {loading && <p>Loading face model...</p>}

//       <div style={{ position: "relative", width: "500px", height: "400px" }}>
//   <video
//     ref={videoRef}
//     autoPlay
//     muted
//     onPlay={handleVideoPlay}
//     style={{
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "500px",
//       height: "400px",
//       borderRadius: "10px",
//       objectFit: "cover",
//     }}
//   />

//   <canvas
//     ref={canvasRef}
//     style={{
//       position: "absolute",
//       top: 0,
//       left: 0,
//     }}
//   />
// </div>
//     </div>
//   );
// };

// export default FaceAttendance;









// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";

// const FaceAttendance = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const intervalRef = useRef(null);
//   const [loading, setLoading] = useState(true);
//   const [faceDetected, setFaceDetected] = useState(false);
//   const [employeeCount, setEmployeeCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     // Update time every second
//     const timeInterval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     const loadModels = async () => {
//       try {
//         const MODEL_URL = "/models";

//         await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
//         await startCamera();
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load face detection models");
//         setLoading(false);
//         console.error("Model loading error:", err);
//       }
//     };

//     loadModels();

//     return () => {
//       clearInterval(timeInterval);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//       if (videoRef.current && videoRef.current.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { width: 1280, height: 720, facingMode: "user" } 
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//       setError("Camera access denied or device is in use. Please grant camera permissions and ensure no other application is using the camera.");
//     }
//   };

//   const handleVideoPlay = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }

//     intervalRef.current = setInterval(async () => {
//       if (videoRef.current && videoRef.current.readyState === 4) {
//         try {
//           const detections = await faceapi.detectAllFaces(
//             videoRef.current,
//             new faceapi.TinyFaceDetectorOptions()
//           );

//           const canvas = canvasRef.current;
//           if (!canvas) return;

//           const displaySize = {
//             width: videoRef.current.videoWidth,
//             height: videoRef.current.videoHeight,
//           };

//           faceapi.matchDimensions(canvas, displaySize);
//           const resizedDetections = faceapi.resizeResults(
//             detections,
//             displaySize
//           );

//           const ctx = canvas.getContext("2d");
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           faceapi.draw.drawDetections(canvas, resizedDetections);

//           setFaceDetected(detections.length > 0);
//           setEmployeeCount(detections.length);
//         } catch (err) {
//           console.error("Detection error:", err);
//         }
//       }
//     }, 300);
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-US', { 
//       weekday: 'long', 
//       year: 'numeric', 
//       month: 'long', 
//       day: 'numeric' 
//     });
//   };

//   const formatTime = (date) => {
//     return date.toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "#0a0e27",
//       fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//       position: "relative",
//       overflow: "hidden"
//     }}>
//       {/* Animated Background */}
//       <div style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: "radial-gradient(circle at 20% 50%, rgba(29, 78, 216, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
//         zIndex: 0
//       }} />
      
//       {/* Grid Pattern Overlay */}
//       <div style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
//                          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
//         backgroundSize: "50px 50px",
//         zIndex: 0
//       }} />

//       <div style={{
//         position: "relative",
//         zIndex: 1,
//         maxWidth: "1400px",
//         margin: "0 auto",
//         padding: "20px",
//       }}>
//         {/* Header Section */}
//         <header style={{
//           background: "rgba(15, 23, 42, 0.8)",
//           backdropFilter: "blur(20px)",
//           borderRadius: "16px",
//           border: "1px solid rgba(255, 255, 255, 0.1)",
//           padding: "24px 32px",
//           marginBottom: "24px",
//           boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
//         }}>
//           <div style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: "16px"
//           }}>
//             <div>
//               <h1 style={{
//                 margin: 0,
//                 fontSize: "clamp(24px, 4vw, 32px)",
//                 fontWeight: "700",
//                 color: "#ffffff",
//                 letterSpacing: "-0.02em",
//                 lineHeight: 1.2
//               }}>
//                 Employee Attendance Portal
//               </h1>
//               <p style={{
//                 margin: "8px 0 0 0",
//                 fontSize: "clamp(13px, 2vw, 15px)",
//                 color: "rgba(255, 255, 255, 0.6)",
//                 fontWeight: "400",
//                 letterSpacing: "0.01em"
//               }}>
//                 Biometric Authentication System
//               </p>
//             </div>
//             <div style={{
//               textAlign: "right"
//             }}>
//               <div style={{
//                 fontSize: "clamp(13px, 2vw, 14px)",
//                 color: "rgba(255, 255, 255, 0.5)",
//                 marginBottom: "4px",
//                 fontWeight: "500",
//                 letterSpacing: "0.05em",
//                 textTransform: "uppercase"
//               }}>
//                 {formatDate(currentTime)}
//               </div>
//               <div style={{
//                 fontSize: "clamp(20px, 3vw, 28px)",
//                 color: "#60a5fa",
//                 fontWeight: "600",
//                 fontVariantNumeric: "tabular-nums",
//                 letterSpacing: "0.02em"
//               }}>
//                 {formatTime(currentTime)}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main Content Grid */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//           gap: "24px",
//           marginBottom: "24px"
//         }}>
//           {/* Status Card */}
//           <div style={{
//             background: "rgba(15, 23, 42, 0.8)",
//             backdropFilter: "blur(20px)",
//             borderRadius: "16px",
//             border: "1px solid rgba(255, 255, 255, 0.1)",
//             padding: "24px",
//             boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease"
//           }}>
//             <div style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: "16px"
//             }}>
//               <span style={{
//                 fontSize: "13px",
//                 color: "rgba(255, 255, 255, 0.5)",
//                 fontWeight: "600",
//                 letterSpacing: "0.1em",
//                 textTransform: "uppercase"
//               }}>
//                 Detection Status
//               </span>
//               <div style={{
//                 width: "12px",
//                 height: "12px",
//                 borderRadius: "50%",
//                 background: loading ? "#64748b" : faceDetected ? "#10b981" : "#ef4444",
//                 boxShadow: loading ? "0 0 20px rgba(100, 116, 139, 0.5)" : faceDetected ? "0 0 20px rgba(16, 185, 129, 0.5)" : "0 0 20px rgba(239, 68, 68, 0.5)",
//                 animation: faceDetected ? "pulse-glow 2s infinite" : "none"
//               }} />
//             </div>
//             <div style={{
//               fontSize: "clamp(24px, 4vw, 36px)",
//               fontWeight: "700",
//               color: loading ? "#64748b" : faceDetected ? "#10b981" : "#ef4444",
//               marginBottom: "8px",
//               letterSpacing: "-0.02em"
//             }}>
//               {loading ? "Initializing" : faceDetected ? "Active" : "Standby"}
//             </div>
//             <div style={{
//               fontSize: "14px",
//               color: "rgba(255, 255, 255, 0.6)",
//               lineHeight: 1.5
//             }}>
//               {loading ? "Loading recognition models..." : faceDetected ? "Face successfully detected" : "Awaiting face detection"}
//             </div>
//           </div>

//           {/* Face Count Card */}
//           <div style={{
//             background: "rgba(15, 23, 42, 0.8)",
//             backdropFilter: "blur(20px)",
//             borderRadius: "16px",
//             border: "1px solid rgba(255, 255, 255, 0.1)",
//             padding: "24px",
//             boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
//             transition: "transform 0.3s ease, box-shadow 0.3s ease"
//           }}>
//             <div style={{
//               fontSize: "13px",
//               color: "rgba(255, 255, 255, 0.5)",
//               fontWeight: "600",
//               letterSpacing: "0.1em",
//               textTransform: "uppercase",
//               marginBottom: "16px"
//             }}>
//               Detected Persons
//             </div>
//             <div style={{
//               fontSize: "clamp(48px, 8vw, 72px)",
//               fontWeight: "800",
//               background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//               backgroundClip: "text",
//               lineHeight: 1,
//               marginBottom: "8px",
//               fontVariantNumeric: "tabular-nums"
//             }}>
//               {employeeCount}
//             </div>
//             <div style={{
//               fontSize: "14px",
//               color: "rgba(255, 255, 255, 0.6)"
//             }}>
//               {employeeCount === 1 ? "Individual" : "Individuals"} in frame
//             </div>
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <div style={{
//             background: "rgba(220, 38, 38, 0.1)",
//             backdropFilter: "blur(20px)",
//             borderRadius: "16px",
//             border: "1px solid rgba(220, 38, 38, 0.3)",
//             padding: "20px 24px",
//             marginBottom: "24px",
//             display: "flex",
//             alignItems: "flex-start",
//             gap: "16px",
//             animation: "slideDown 0.3s ease"
//           }}>
//             <div style={{
//               fontSize: "24px",
//               flexShrink: 0
//             }}>⚠️</div>
//             <div>
//               <div style={{
//                 fontSize: "15px",
//                 fontWeight: "600",
//                 color: "#fca5a5",
//                 marginBottom: "4px"
//               }}>
//                 System Error
//               </div>
//               <div style={{
//                 fontSize: "14px",
//                 color: "rgba(255, 255, 255, 0.7)",
//                 lineHeight: 1.6
//               }}>
//                 {error}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Camera Section */}
//         <div style={{
//           background: "rgba(15, 23, 42, 0.8)",
//           backdropFilter: "blur(20px)",
//           borderRadius: "16px",
//           border: "1px solid rgba(255, 255, 255, 0.1)",
//           padding: "clamp(16px, 3vw, 32px)",
//           boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
//           marginBottom: "24px"
//         }}>
//           <div style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             minHeight: "400px",
//             position: "relative"
//           }}>
//             {loading ? (
//               <div style={{ 
//                 textAlign: "center",
//                 padding: "40px"
//               }}>
//                 <div style={{
//                   width: "80px",
//                   height: "80px",
//                   border: "3px solid rgba(96, 165, 250, 0.2)",
//                   borderTop: "3px solid #60a5fa",
//                   borderRadius: "50%",
//                   animation: "spin 1s linear infinite",
//                   margin: "0 auto 24px"
//                 }} />
//                 <div style={{
//                   fontSize: "18px",
//                   color: "rgba(255, 255, 255, 0.9)",
//                   fontWeight: "500",
//                   marginBottom: "8px"
//                 }}>
//                   Initializing Biometric System
//                 </div>
//                 <div style={{
//                   fontSize: "14px",
//                   color: "rgba(255, 255, 255, 0.5)"
//                 }}>
//                   Loading facial recognition models...
//                 </div>
//                 <style>
//                   {`
//                     @keyframes spin {
//                       0% { transform: rotate(0deg); }
//                       100% { transform: rotate(360deg); }
//                     }
//                     @keyframes pulse-glow {
//                       0%, 100% { opacity: 1; transform: scale(1); }
//                       50% { opacity: 0.7; transform: scale(1.1); }
//                     }
//                     @keyframes slideDown {
//                       from {
//                         opacity: 0;
//                         transform: translateY(-10px);
//                       }
//                       to {
//                         opacity: 1;
//                         transform: translateY(0);
//                       }
//                     }
//                   `}
//                 </style>
//               </div>
//             ) : (
//               <div style={{
//                 position: "relative",
//                 width: "100%",
//                 maxWidth: "800px",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//                 boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
//                 border: "2px solid rgba(96, 165, 250, 0.3)"
//               }}>
//                 {/* Video Feed */}
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   muted
//                   playsInline
//                   onPlay={handleVideoPlay}
//                   style={{
//                     width: "100%",
//                     height: "auto",
//                     display: "block",
//                     background: "#000"
//                   }}
//                 />
                
//                 {/* Canvas Overlay */}
//                 <canvas
//                   ref={canvasRef}
//                   style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     height: "100%"
//                   }}
//                 />
                
//                 {/* Status Indicator Overlay */}
//                 <div style={{
//                   position: "absolute",
//                   top: "16px",
//                   left: "16px",
//                   right: "16px",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   flexWrap: "wrap",
//                   gap: "12px"
//                 }}>
//                   {/* Detection Badge */}
//                   <div style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "10px",
//                     background: "rgba(0, 0, 0, 0.7)",
//                     backdropFilter: "blur(10px)",
//                     padding: "10px 16px",
//                     borderRadius: "8px",
//                     border: `1px solid ${faceDetected ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)"}`,
//                     boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
//                   }}>
//                     <div style={{
//                       width: "10px",
//                       height: "10px",
//                       borderRadius: "50%",
//                       background: faceDetected ? "#10b981" : "#ef4444",
//                       boxShadow: faceDetected ? "0 0 10px rgba(16, 185, 129, 0.8)" : "0 0 10px rgba(239, 68, 68, 0.8)",
//                       animation: faceDetected ? "pulse-glow 2s infinite" : "none"
//                     }} />
//                     <span style={{
//                       fontSize: "13px",
//                       fontWeight: "600",
//                       color: "#ffffff",
//                       letterSpacing: "0.02em"
//                     }}>
//                       {faceDetected ? "FACE DETECTED" : "NO DETECTION"}
//                     </span>
//                   </div>

//                   {/* Live Indicator */}
//                   <div style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     background: "rgba(0, 0, 0, 0.7)",
//                     backdropFilter: "blur(10px)",
//                     padding: "10px 16px",
//                     borderRadius: "8px",
//                     border: "1px solid rgba(239, 68, 68, 0.5)",
//                     boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
//                   }}>
//                     <div style={{
//                       width: "8px",
//                       height: "8px",
//                       borderRadius: "50%",
//                       background: "#ef4444",
//                       boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
//                       animation: "pulse-glow 1.5s infinite"
//                     }} />
//                     <span style={{
//                       fontSize: "12px",
//                       fontWeight: "600",
//                       color: "#ffffff",
//                       letterSpacing: "0.05em"
//                     }}>
//                       LIVE
//                     </span>
//                   </div>
//                 </div>

//                 {/* Scanning Line Animation */}
//                 {faceDetected && (
//                   <div style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     height: "2px",
//                     background: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.8), transparent)",
//                     animation: "scan 2s linear infinite"
//                   }}>
//                     <style>
//                       {`
//                         @keyframes scan {
//                           0% { transform: translateY(0); }
//                           100% { transform: translateY(600px); }
//                         }
//                       `}
//                     </style>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Instructions Panel */}
//         <div style={{
//           background: "rgba(15, 23, 42, 0.8)",
//           backdropFilter: "blur(20px)",
//           borderRadius: "16px",
//           border: "1px solid rgba(255, 255, 255, 0.1)",
//           padding: "clamp(20px, 3vw, 32px)",
//           boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
//         }}>
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             marginBottom: "20px"
//           }}>
//             <div style={{
//               width: "4px",
//               height: "24px",
//               background: "linear-gradient(180deg, #60a5fa 0%, #a78bfa 100%)",
//               borderRadius: "2px"
//             }} />
//             <h3 style={{
//               margin: 0,
//               fontSize: "clamp(18px, 3vw, 22px)",
//               fontWeight: "600",
//               color: "#ffffff",
//               letterSpacing: "-0.01em"
//             }}>
//               Authentication Guidelines
//             </h3>
//           </div>
          
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//             gap: "16px"
//           }}>
//             {[
//               { icon: "📍", title: "Positioning", desc: "Center your face within the camera frame" },
//               { icon: "💡", title: "Lighting", desc: "Ensure adequate front-facing illumination" },
//               { icon: "👁️", title: "Eye Contact", desc: "Look directly at the camera lens" },
//               { icon: "⏱️", title: "Processing", desc: "Wait for green confirmation indicator" },
//               { icon: "🔒", title: "Privacy", desc: "Your biometric data is encrypted and secure" },
//               { icon: "⚙️", title: "Permissions", desc: "Grant camera access when prompted" }
//             ].map((item, index) => (
//               <div key={index} style={{
//                 padding: "16px",
//                 background: "rgba(255, 255, 255, 0.03)",
//                 borderRadius: "12px",
//                 border: "1px solid rgba(255, 255, 255, 0.05)",
//                 transition: "all 0.3s ease"
//               }}>
//                 <div style={{
//                   fontSize: "24px",
//                   marginBottom: "8px"
//                 }}>
//                   {item.icon}
//                 </div>
//                 <div style={{
//                   fontSize: "14px",
//                   fontWeight: "600",
//                   color: "#60a5fa",
//                   marginBottom: "4px",
//                   letterSpacing: "0.01em"
//                 }}>
//                   {item.title}
//                 </div>
//                 <div style={{
//                   fontSize: "13px",
//                   color: "rgba(255, 255, 255, 0.6)",
//                   lineHeight: 1.5
//                 }}>
//                   {item.desc}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <footer style={{
//           marginTop: "32px",
//           padding: "24px",
//           textAlign: "center",
//           color: "rgba(255, 255, 255, 0.4)",
//           fontSize: "13px",
//           borderTop: "1px solid rgba(255, 255, 255, 0.05)"
//         }}>
//           <div style={{
//             marginBottom: "8px",
//             fontSize: "12px",
//             letterSpacing: "0.1em",
//             textTransform: "uppercase"
//           }}>
//             Powered by Advanced Biometric Technology
//           </div>
//           <div>
//             © {new Date().getFullYear()} Employee Attendance System. All rights reserved.
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default FaceAttendance;



import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceAttendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      startCamera();
      setLoading(false);
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        const canvas = canvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        setFaceDetected(detections.length > 0);
        setEmployeeCount(detections.length);
      }
    }, 300);

    return () => clearInterval(interval);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "30px",
          color: "white",
          textAlign: "center"
        }}>
          <h1 style={{
            margin: "0 0 10px 0",
            fontSize: "32px",
            fontWeight: "600",
            letterSpacing: "0.5px"
          }}>
            Employee Attendance System
          </h1>
          <p style={{
            margin: 0,
            fontSize: "16px",
            opacity: 0.95
          }}>
            Face Detection & Recognition
          </p>
        </div>

        {/* Main Content */}
        <div style={{ padding: "40px" }}>
          {/* Status Bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
            gap: "20px"
          }}>
            <div style={{
              flex: 1,
              padding: "20px",
              background: loading ? "#f3f4f6" : faceDetected ? "#dcfce7" : "#fee2e2",
              borderRadius: "12px",
              border: `2px solid ${loading ? "#e5e7eb" : faceDetected ? "#86efac" : "#fca5a5"}`,
              transition: "all 0.3s ease"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "5px",
                fontWeight: "500"
              }}>
                System Status
              </div>
              <div style={{
                fontSize: "20px",
                fontWeight: "600",
                color: loading ? "#6b7280" : faceDetected ? "#059669" : "#dc2626"
              }}>
                {loading ? "Initializing..." : faceDetected ? "Face Detected" : "No Face Detected"}
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: "20px",
              background: "#eff6ff",
              borderRadius: "12px",
              border: "2px solid #bfdbfe"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "5px",
                fontWeight: "500"
              }}>
                Detected Faces
              </div>
              <div style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#2563eb"
              }}>
                {employeeCount} {employeeCount === 1 ? "Person" : "People"}
              </div>
            </div>
          </div>

          {/* Camera View */}
          <div style={{
            background: "#f9fafb",
            borderRadius: "16px",
            padding: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "500px"
          }}>
            {loading ? (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px"
                }}></div>
                <p style={{
                  fontSize: "18px",
                  color: "#6b7280",
                  margin: 0
                }}>
                  Loading face detection models...
                </p>
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            ) : (
              <div style={{
                position: "relative",
                width: "640px",
                height: "480px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onPlay={handleVideoPlay}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                />
                
                {/* Detection Indicator */}
                <div style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.95)",
                  padding: "12px 20px",
                  borderRadius: "30px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: faceDetected ? "#10b981" : "#ef4444",
                    animation: faceDetected ? "pulse 2s infinite" : "none"
                  }}></div>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1f2937"
                  }}>
                    {faceDetected ? "Scanning..." : "Position Face"}
                  </span>
                </div>
                
                <style>
                  {`
                    @keyframes pulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.5; }
                    }
                  `}
                </style>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{
            marginTop: "30px",
            padding: "25px",
            background: "#fef3c7",
            borderRadius: "12px",
            border: "2px solid #fde68a"
          }}>
            <h3 style={{
              margin: "0 0 15px 0",
              fontSize: "18px",
              color: "#92400e",
              fontWeight: "600"
            }}>
              Instructions
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#78350f",
              lineHeight: "1.8"
            }}>
              <li>Position your face in the center of the camera frame</li>
              <li>Ensure adequate lighting for better detection accuracy</li>
              <li>Look directly at the camera for optimal recognition</li>
              <li>Wait for the green indicator before proceeding</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 40px",
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px"
        }}>
          © 2025 Employee Attendance System | Powered by Face Recognition Technology
        </div>
      </div>
    </div>
  );
};

export default FaceAttendance;