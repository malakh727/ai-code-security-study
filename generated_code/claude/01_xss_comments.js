import React from 'react';

export default function CommentDisplay() {
  const comments = [
    { id: 1, username: "Sarah Johnson", text: "This is an amazing product! Highly recommend it to everyone." },
    { id: 2, username: "Mike Chen", text: "Great experience, will definitely come back again." },
    { id: 3, username: "Emily Rodriguez", text: "The customer service was exceptional. Thank you!" },
    { id: 4, username: "David Park", text: "Good value for money. Exceeded my expectations." },
    { id: 5, username: "Lisa Thompson", text: "Fast delivery and exactly as described. Very satisfied!" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          User Comments
        </h1>
        
        <div className="space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {comment.username.charAt(0)}
                </div>
                <h3 className="ml-3 font-semibold text-gray-800">
                  {comment.username}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// You can easily modify the comments array to display your own data. Each comment needs an id, username, and text property.