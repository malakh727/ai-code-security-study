import React from "react";

const CommentsList = ({ comments }) => {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Comments</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {comments.map((comment, index) => (
          <li
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            <strong>{comment.username}</strong>
            <p style={{ margin: "6px 0 0" }}>{comment.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsList;


// Example usage:
// import React from "react";
// import CommentsList from "./CommentsList";

// const commentsData = [
//   { username: "Alice", text: "This is a great post!" },
//   { username: "Bob", text: "Thanks for sharing!" },
//   { username: "Charlie", text: "Very helpful content." },
// ];

// function App() {
//   return <CommentsList comments={commentsData} />;
// }

// export default App;