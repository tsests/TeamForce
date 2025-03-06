import React, { useState, useEffect } from "react";
import "./NewProposals.css";

const NewProposals = () => {
  const [proposals, setProposals] = useState([]);

  // Функция для выполнения GET-запроса
  const fetchProposals = async () => {
    try {
      const response = await fetch("http://172.30.192.44:8000/suggestions/");
      if (response.ok) {
        const data = await response.json();
        console.log("Data received:", data); // Логируем полученные данные
        setProposals(data); // Сохраняем полученные данные
      } else {
        console.error("Failed to fetch proposals");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  // Выполняем запрос при монтировании компонента
  useEffect(() => {
    fetchProposals();
  }, []);

  // Используем все предложения без фильтрации
  const newProposals = proposals;

  return (
    <div>
      <h2>Новые предложения</h2>
      {newProposals.length > 0 ? (
        newProposals.map((proposal) => (
          <div key={proposal.id} className="proposal-card">
            <h2>{proposal.title}</h2>
            <p>{proposal.text}</p>
            <p><strong>Дата:</strong> {proposal.datetime}</p>
            <p><strong>Голосов:</strong> {proposal.score}</p>
            <div className="comments">
              <h3>Комментарии:</h3>
              {proposal.comments.map((comment, i) => (
                <p key={i}>{comment}</p>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>Предложений нет.</p>
      )}
    </div>
  );
};

export default NewProposals;