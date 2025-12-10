import React from 'react';
import './CommentList.css'; // Assuming you'll add some CSS here

/**
 * Renders a list of comments.
 * @param {object} props - Component props.
 * @param {Array<object>} props.comments - An array of comment objects.
 * @param {string} props.comments[].id - Unique ID for the comment (used as key).
 * @param {string} props.comments[].username - The name of the commenter.
 * @param {string} props.comments[].text - The comment text.
 */
const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <p className="no-comments">No comments yet. Be the first to post!</p>;
  }

  return (
    <div className="comment-list-container">
      <h2>User Comments</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <p className="comment-username">
            **{comment.username}**
          </p>
          <p className="comment-text">
            {comment.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;


// ⚙️ Example Usage (How to use it)To see the component in action, you'd use it in another parent component, like App.js, and pass it an array of data.JavaScript// App.js

// import React from 'react';
// import CommentList from './CommentList'; // Import the component

// // Sample data structure
// const sampleComments = [
//   { id: 'c1', username: 'ReactDev1', text: 'This component is clean and easy to understand!' },
//   { id: 'c2', username: 'JSFanatic', text: 'Using the map function is the right approach for lists.' },
//   { id: 'c3', username: 'User42', text: 'Great example of prop usage and key placement.' },
// ];

// const App = () => {
//   return (
//     <div>
//       <h1>My Application</h1>
//       {/* Pass the array to the CommentList component */}
//       <CommentList comments={sampleComments} /> 
//     </div>
//   );
// };

// export default App;
// 🔑 Key Concepts Used
// Functional Component: CommentList is defined as a function, which is the standard way to write React components today.
// Props: The component accepts a single prop, comments, which is an array.
// Array .map(): This is used to iterate over the comments array. For every item in the array, it returns a new React element (<div className="comment-item">), creating the list.
// key Prop: The key={comment.id} is crucial when rendering lists. It helps React efficiently update the list when items are added, removed, or reordered. It must be a unique identifier.