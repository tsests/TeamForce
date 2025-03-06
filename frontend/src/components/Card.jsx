import React, { useState, useEffect } from "react";
import "./Card.css";

const Card = ({
  index,
  title,
  description,
  status,
  date,
  votes,
  onVote,
  onUnvote,
  onEdit,
  onAddComment,
  user_id,
}) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://172.30.192.44:8000/suggestions/${index}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          console.error("Failed to fetch comments");
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [index]);

  const handleVote = async (voteType) => {
    if (!hasVoted) {
      await onVote(voteType);
      setHasVoted(true);
    }
  };

  const handleUnvote = async () => {
    if (hasVoted) {
      await onUnvote();
      setHasVoted(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await onAddComment(index, newComment, user_id);
      setNewComment("");
      const response = await fetch(`http://172.30.192.44:8000/suggestions/${index}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    }
  };

  return (
    <div className="card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="card-info">
        <span className="date">{date}</span>
        <span className="status">Статус: {status}</span>
        <span className="votes">Голосов: {votes}</span>
      </div>
      <div className="vote-buttons">
        <button
          className={`vote-button ${hasVoted ? "voted" : ""}`}
          onClick={() => handleVote("vote")}
          disabled={hasVoted}
        >
          За
        </button>
        <button
          className={`vote-button ${hasVoted ? "voted" : ""}`}
          onClick={() => handleVote("unvote")}
          disabled={hasVoted}
        >
          Против
        </button>
        <button
          className={`unvote-button ${!hasVoted ? "disabled" : ""}`}
          onClick={handleUnvote}
          disabled={!hasVoted}
        >
          Отменить голос
        </button>
      </div>
      <button className="edit-button" onClick={onEdit}>
        Редактировать
      </button>

      <div className="comments-section">
        <h3>Комментарии:</h3>
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p><strong>Пользователь {comment.user_id}</strong>: {comment.text}</p>
            <span className="comment-date">{comment.created_at}</span>
          </div>
        ))}
        <textarea
          placeholder="Добавить комментарий..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Отправить</button>
      </div>
    </div>
  );
};

export default Card;