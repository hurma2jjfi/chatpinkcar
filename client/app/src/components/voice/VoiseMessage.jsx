import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicroSvg from '../../assets/micro.svg';
import '../styles/ToolbarVoice.css';

const VoiceMessage = ({ setMessage }) => {
    const { transcript, resetTranscript } = useSpeechRecognition();
    const [isRecording, setIsRecording] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (isRecording) {
            setMessage(transcript); // Update message in real-time
            setShowOverlay(true); // Show "Speak..." text
            setFadeOut(false); // Reset fade-out effect
        } else {
            resetTranscript();
            if (showOverlay) {
                // Hide text immediately after recognition ends
                const hideTimeoutId = setTimeout(() => {
                    setFadeOut(true); // Set fade-out effect
                    const finalHideTimeoutId = setTimeout(() => {
                        setShowOverlay(false); // Hide text after fading out
                        setFadeOut(false); // Reset fade-out effect for next call
                    }, 500); // Delay before hiding text

                    return () => clearTimeout(finalHideTimeoutId); // Cleanup timer on unmount
                }, 1000); // Delay before starting to fade out

                return () => clearTimeout(hideTimeoutId); // Cleanup timer on unmount
            }
        }
    }, [transcript, isRecording, setMessage]); // Dependencies for updates

    const handleStartRecording = () => {
        setIsRecording(true);
        SpeechRecognition.startListening();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        SpeechRecognition.stopListening();
    };

    return (
        <>
            <div className={`voice-message-container ${isRecording ? 'blurred' : ''}`}>
                <button 
                    title='Speak...' 
                    className='micro' 
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                    <div className="flex__micro">
                        <img className='micro__icon' src={MicroSvg} alt="Microphone" />
                    </div>
                </button>
            </div>
            {showOverlay && (
                <div className={`overlay ${fadeOut ? 'fade-out' : ''}`}>
                    <div className="sound-waves">
                        <div className={`wave ${isRecording ? 'pulsing' : ''}`}></div>
                        <div className={`wave ${isRecording ? 'pulsing' : ''}`}></div>
                        <div className={`wave ${isRecording ? 'pulsing' : ''}`}></div>
                    </div>
                    <span className={`typing-effect ${isRecording ? 'zoom-in' : ''}`}>
                        Voice...
                    </span>
                </div>
            )}
        </>
    );
};

export default VoiceMessage;
