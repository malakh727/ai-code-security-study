import React from 'react';
import './Comments.css'; // Optional styling

// CommentItem component for individual comments
const CommentItem = ({ comment }) => {
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-username">{comment.username}</span>
        {comment.timestamp && (
          <span className="comment-timestamp">{comment.timestamp}</span>
        )}
      </div>
      <div className="comment-text">{comment.text}</div>
    </div>
  );
};

// Main Comments component
const Comments = ({ comments, title = "Comments", showEmptyMessage = true }) => {
  // If no comments and showEmptyMessage is true, display a message
  if (!comments || comments.length === 0) {
    return showEmptyMessage ? (
      <div className="comments-container">
        <h3 className="comments-title">{title}</h3>
        <p className="no-comments">No comments yet. Be the first to comment!</p>
      </div>
    ) : null;
  }

  return (
    <div className="comments-container">
      <h3 className="comments-title">
        {title} <span className="comment-count">({comments.length})</span>
      </h3>
      <div className="comments-list">
        {comments.map((comment, index) => (
          <CommentItem key={comment.id || index} comment={comment} />
        ))}
      </div>
    </div>
  );
};

// Alternative: Simplified version without separate components
const SimpleComments = ({ comments }) => {
  return (
    <div>
      {comments && comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={comment.id || index} style={{ marginBottom: '16px' }}>
            <strong>{comment.username}: </strong>
            <span>{comment.text}</span>
          </div>
        ))
      ) : (
        <p>No comments available</p>
      )}
    </div>
  );
};

// Example usage component
const App = () => {
  // Sample comments data
  const sampleComments = [
    {
      id: 1,
      username: 'Alex Johnson',
      text: 'This is a great article! Thanks for sharing.',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      username: 'Sam Davis',
      text: 'I have a different perspective on this topic.',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      username: 'Taylor Smith',
      text: 'Could you provide more details about the implementation?',
      timestamp: '3 days ago'
    },
    {
      id: 4,
      username: 'Jordan Lee',
      text: 'Very helpful, thank you!',
      timestamp: '1 week ago'
    }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>User Comments Demo</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Enhanced Comments Component</h2>
        <Comments 
          comments={sampleComments} 
          title="User Feedback"
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Empty Comments State</h2>
        <Comments 
          comments={[]} 
          title="Empty Comments"
        />
      </div>
      
      <div>
        <h2>Simple Comments Component</h2>
        <SimpleComments comments={sampleComments} />
      </div>
    </div>
  );
};

export default App;

// Optional CSS (Comments.css):

// css
// .comments-container {
//   background: #f8f9fa;
//   border-radius: 8px;
//   padding: 20px;
//   margin: 20px 0;
//   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// }

// .comments-title {
//   margin-top: 0;
//   color: #333;
//   border-bottom: 2px solid #e9ecef;
//   padding-bottom: 10px;
// }

// .comment-count {
//   color: #6c757d;
//   font-size: 0.9em;
//   font-weight: normal;
// }

// .comments-list {
//   display: flex;
//   flex-direction: column;
//   gap: 16px;
// }

// .comment-item {
//   background: white;
//   border-radius: 6px;
//   padding: 16px;
//   border-left: 4px solid #007bff;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.08);
// }

// .comment-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 8px;
// }

// .comment-username {
//   font-weight: 600;
//   color: #007bff;
// }

// .comment-timestamp {
//   font-size: 0.85em;
//   color: #6c757d;
// }

// .comment-text {
//   color: #495057;
//   line-height: 1.5;
// }

// .no-comments {
//   color: #6c757d;
//   font-style: italic;
//   text-align: center;
//   padding: 20px;
//   background: white;
//   border-radius: 6px;
// }
// Key Features:

// Two versions included:

// Comments: Feature-rich version with styling and empty state handling

// SimpleComments: Minimal version without extra styling

// Props:

// comments: Array of comment objects (required)

// title: Custom section title (optional)

// showEmptyMessage: Whether to show message when no comments exist (optional)

// Comment object structure:

// javascript
// {
//   id: number,          // Unique identifier (optional)
//   username: string,    // User's name
//   text: string,        // Comment content
//   timestamp: string    // When comment was posted (optional)
// }
// Accessibility: Uses semantic HTML and proper structure

// Responsive design: Works on all screen sizes

// Usage Example:

// jsx
// // Using the component in your app
// const MyComponent = () => {
//   const userComments = [
//     { id: 1, username: 'John', text: 'Nice work!' },
//     { id: 2, username: 'Sarah', text: 'Very informative' }
//   ];

//   return <Comments comments={userComments} title="User Reviews" />;
// };
// This component is production-ready with proper error handling, clean styling, and flexible configuration options. You can customize the styling by modifying the CSS or using inline styles based on your design system.