'use client';

import React from 'react';

// Define the shape of a comment
// interface Comment {
//   id: number;
//   username: string;
//   text: string;
// }

// // Sample data
// const sampleComments: Comment[] = [
//   { id: 1, username: 'alice_wonder', text: 'This is a great article! Really enjoyed reading it.' },
//   { id: 2, username: 'bob_builder', text: 'Thanks for the helpful tips. Will definitely try them out.' },
//   { id: 3, username: 'charlie_chaplin', text: 'Interesting perspective. Made me think differently about the topic.' },
//   { id: 4, username: 'diana_prince', text: 'Well written and informative. Keep up the good work!' },
// ];

export default function CommentsSection() {
  return (
    <>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">User Comments</h2>
        
        {sampleComments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {sampleComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">@{comment.username}</span>
                </div>
                <p className="text-gray-700 ml-13">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// This React component creates a clean, modern comments section that:

// Displays comments from an array of comment objects
// Shows each user's avatar (initial letter in a gradient circle)
// Displays the username with an @ prefix
// Shows the comment text
// Includes proper spacing and hover effects
// Handles the case when there are no comments
// Uses Tailwind CSS for styling (works with Next.js App Router)

// To use this component:

// Make sure you have Tailwind CSS configured in your project
// Save this as a component file (e.g., CommentsSection.tsx)
// Import and use it in your page or other components

// You can easily replace the sampleComments array with your own data from props or an API call.