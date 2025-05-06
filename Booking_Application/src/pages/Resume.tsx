//@ts-nocheck
import React, { useState } from "react";
import { SERVER_URL } from "../services/axios";
 
const VoiceFilterAI = () => {
  const [text, setText] = useState("");
  const [filters, setFilters] = useState([]); // Ensure filters is initialized as an empty array
 
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
 
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
 
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      sendTextToAI(transcript);
    };
 
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };
  };
  const sendTextToAI = async (voiceText) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/ai-model/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voiceText }), // Send the recognized text
      });
 
      const data = await response.json();
      if (response.ok) {
        setFilters(data.message); // Adjust based on the response structure
        console.log("Extracted Filters:", data.message);
      } else {
        console.error("Error from server:", data.error);
      }
    } catch (error) {
      console.error("Error processing text:", error);
    }
  };
 
  return (
    <div>
      <h2>AI-Powered Voice Filter Selection</h2>
      <button onClick={handleVoiceInput}>🎤 Speak Now</button>
      <p>Recognized Text: <strong>{text}</strong></p>
      <p>Extracted Filters: <strong>{filters||"No filters extracted."}</strong></p>
    </div>
  );
};
 
export default VoiceFilterAI;
 