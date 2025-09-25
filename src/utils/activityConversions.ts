// Utility functions for converting between frontend string types and backend integer types

// Convert frontend preference string to backend integer
export const preferenceToInt = (preference: "LIKE" | "DISLIKE" | "NEUTRAL"): number => {
  switch (preference) {
    case "LIKE":
      return 1;
    case "DISLIKE":
      return -1;
    case "NEUTRAL":
    default:
      return 0;
  }
};

// Convert backend integer to frontend preference string
export const intToPreference = (value: number): "LIKE" | "DISLIKE" | "NEUTRAL" => {
  switch (value) {
    case 1:
      return "LIKE";
    case -1: 
      return "DISLIKE";
    case 0:
    default:
      return "NEUTRAL";
  }
};

// Convert frontend recommendation string to backend integer
export const recommendationToInt = (recommendation: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL"): number => {
  switch (recommendation) {
    case "RECOMMENDED":
      return 1;
    case "NOT_RECOMMENDED":
      return -1;
    case "NEUTRAL":
    default:
      return 0;
  }
};

// Convert backend integer to frontend recommendation string
export const intToRecommendation = (value: number): "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL" => {
  switch (value) {
    case 1:
      return "RECOMMENDED";
    case -1:
      return "NOT_RECOMMENDED";
    case 0:
    default:
      return "NEUTRAL";
  }
};