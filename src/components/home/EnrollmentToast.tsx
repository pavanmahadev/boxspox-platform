"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

const NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Karan", "Pooja", "Rohan", "Neha"];
const LOCATIONS = ["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];
const COURSES = [
  "Full Stack Web Development",
  "Data Science & Machine Learning",
  "Mobile App Development",
  "UI/UX Design Masterclass",
  "Lifetime Premium Bundle",
  "Cloud Computing with AWS"
];

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomTime = () => Math.floor(Math.random() * 50) + 2; // 2 to 50 minutes ago

interface NotificationData {
  id: number;
  name: string;
  location: string;
  course: string;
  timeAgo: number;
}

export function EnrollmentToast() {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    // Wait a few seconds before showing the first one
    const initialDelay = setTimeout(() => {
      showRandomNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showRandomNotification = () => {
    const newNotif = {
      id: Date.now(),
      name: getRandomItem(NAMES),
      location: getRandomItem(LOCATIONS),
      course: getRandomItem(COURSES),
      timeAgo: getRandomTime()
    };
    
    setNotification(newNotif);

    // Hide it after 6 seconds
    setTimeout(() => {
      setNotification(null);
      
      // Schedule the next one (between 10 and 25 seconds later)
      const nextDelay = Math.floor(Math.random() * 15000) + 10000;
      setTimeout(showRandomNotification, nextDelay);
    }, 6000);
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 50, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 9999,
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            maxWidth: "320px"
          }}
        >
          <button 
            onClick={() => setNotification(null)}
            style={{ position: "absolute", top: "6px", right: "6px", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex" }}
          >
            <X size={12} />
          </button>
          
          <div style={{ position: "relative" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${notification.name}`} 
                alt={notification.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", background: "white", borderRadius: "50%", padding: "1px" }}>
              <CheckCircle2 size={12} color="#10B981" fill="#10B981" style={{ color: "white" }} />
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>
              {notification.name} from {notification.location}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.3 }}>
              Just enrolled in <span style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{notification.course}</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "2px", fontWeight: 600 }}>
              {notification.timeAgo} minutes ago
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
