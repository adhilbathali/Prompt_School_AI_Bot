import "./App.css";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const chatBodyRef = useRef(null); 

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handlePost = async () => {
    if (!inputValue.trim()) {
      alert("Please enter the message");
      return;
    }

    // Add user message to state
    setMessages((prev) => [...prev, { text: inputValue, type: "user" }]);

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        userMessage: inputValue,
      });

      // Clear input
      setInputValue("");

      // Add bot response to state
      setMessages((prev) => [
        ...prev,
        { text: response.data.botMessage, type: "bot" },
      ]);
    } catch (err) {
      console.error("Error submitting message", err);
    }
  };

  return (
    <section className="chat-bot">
      <div className="chat-header">
        <h1>AI Chatbot</h1>
      </div>

      {/* Attach ref here */}
      <div id="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <p key={index} className={msg.type === "user" ? "chat-user-text" : "chat-bot-text"}>
            {msg.text}
          </p>
        ))}
      </div>

      <div className="chat-input">
        <input
          id="chat-input"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type your message..."
        />
        <button onClick={handlePost}>Send</button>
      </div>
    </section>
  );
}
