import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Card from "./components/Card";
import NewProposals from "./pages/NewProposals";
import InProgressProposals from "./pages/InProgressProposals";
import AcceptedProposals from "./pages/AcceptedProposals";
import RejectedProposals from "./pages/RejectedProposals";
import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    status: "new",
    votes: 0,
    comments: [],
    user_id: 4,
    score: 0,
  });
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch("http://172.30.192.44:8000/suggestions/");
      if (response.ok) {
        const data = await response.json();
        const proposalsWithComments = await Promise.all(
          data.map(async (proposal) => {
            const comments = await fetchComments(proposal.id);
            return { ...proposal, comments };
          })
        );
        setProposals(proposalsWithComments);
      } else {
        console.error("Failed to fetch proposals");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  };

  const fetchComments = async (suggestionId) => {
    try {
      const response = await fetch(`http://172.30.192.44:8000/comments/?suggestion_id=${suggestionId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Failed to fetch comments");
        return [];
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const openModal = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setNewProposal({
        ...proposals[index],
        user_id: parseInt(proposals[index].user_id, 10),
      });
    } else {
      setEditingIndex(null);
      setNewProposal({
        title: "",
        description: "",
        status: "new",
        votes: 0,
        comments: [],
        user_id: 4,
        score: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewProposal({
      title: "",
      description: "",
      status: "new",
      votes: 0,
      comments: [],
      user_id: 4,
      score: 0,
    });
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProposal({ ...newProposal, [name]: value });
  };

  const addOrUpdateProposal = async () => {
    if (newProposal.title && newProposal.description) {
      try {
        const response = await fetch("http://172.30.192.44:8000/suggestions/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newProposal.title,
            text: newProposal.description,
            user_id: parseInt(newProposal.user_id, 10),
          }),
        });

        if (response.ok) {
          closeModal();
          fetchProposals();
        } else {
          console.error("Failed to submit proposal");
        }
      } catch (error) {
        console.error("Error sending proposal:", error);
      }
    }
  };

  const addComment = async (suggestionId, text, userId) => {
    try {
      const response = await fetch(`http://172.30.192.44:8000/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          user_id: userId,
          text: text,
        }),
      });
  
      if (response.ok) {
        fetchProposals();
      } else {
        console.error("Failed to submit comment. Status:", response.status);
        const errorData = await response.json();
        console.error("Error details:", errorData);
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  const handleVote = async (suggestionId, voteType) => {
    try {
      const response = await fetch(`http://172.30.192.44:8000/vote/?suggestion_id=${suggestionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          user_id: 4, // Замените на реальный user_id
        }),
      });

      if (response.ok) {
        fetchProposals();
      } else {
        console.error("Failed to submit vote");
      }
    } catch (error) {
      console.error("Error sending vote:", error);
    }
  };

  const handleUnvote = async (suggestionId) => {
    try {
      const response = await fetch(`http://172.30.192.44:8000/unvote?suggestion_id=${suggestionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          user_id: 4, // Замените на реальный user_id
        }),
      });

      if (response.ok) {
        fetchProposals();
      } else {
        console.error("Failed to unvote");
      }
    } catch (error) {
      console.error("Error sending unvote:", error);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <Link to="/">
            <div className="logo">
              <img src="public/logo.png" alt="нажми на меня" />
            </div>
          </Link>
          <nav>
            <ul>
              <button className="createProposal" onClick={() => openModal()}>
                Создать предложение
              </button>
              <div className="filter-buttons">
                <Link to="/new">
                  <button>Новые</button>
                </Link>
                <Link to="/in-progress">
                  <button>В работе</button>
                </Link>
                <Link to="/accepted">
                  <button>Принятые</button>
                </Link>
                <Link to="/rejected">
                  <button>Отклонённые</button>
                </Link>
              </div>
              <button className="profile-button">Профиль</button>
            </ul>
          </nav>
        </header>

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {proposals.map((proposal) => (
                    <Card
                      key={proposal.id}
                      index={proposal.id}
                      title={proposal.title}
                      description={proposal.text}
                      status={proposal.state}
                      date={proposal.datetime}
                      votes={proposal.score}
                      comments={proposal.comments}
                      onVote={(voteType) => handleVote(proposal.id, voteType)}
                      onUnvote={() => handleUnvote(proposal.id)}
                      onEdit={() => openModal(proposal.id)}
                      onAddComment={(suggestionId, text, userId) => addComment(suggestionId, text, userId)}
                      user_id={4}
                    />
                  ))}
                </>
              }
            />
            <Route path="/new" element={<NewProposals proposals={proposals} />} />
            <Route path="/in-progress" element={<InProgressProposals />} />
            <Route path="/accepted" element={<AcceptedProposals />} />
            <Route path="/rejected" element={<RejectedProposals />} />
          </Routes>
        </main>

        <footer className="footer">
          <h2>О нас</h2>
          <p>Команда: <strong>TeamForce</strong></p>
          <ul>
            <li><strong>Backend:</strong> Яков Гречнев, Коробков Ярослав, Калинин Никита</li>
            <li><strong>Frontend:</strong> Фролова Дарья, Мальцев Илья</li>
            <li><strong>Тестировщики:</strong> Мартынова Яна, Медведев Егор</li>
          </ul>
        </footer>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>{editingIndex !== null ? "Редактировать предложение" : "Создать новое предложение"}</h2>
              <input
                type="text"
                name="title"
                placeholder="Название"
                value={newProposal.title}
                onChange={handleInputChange}
              />
              <textarea
                name="description"
                placeholder="Содержание"
                value={newProposal.description}
                onChange={handleInputChange}
              />
              <button onClick={addOrUpdateProposal}>
                {editingIndex !== null ? "Сохранить" : "Добавить"}
              </button>
              <button onClick={closeModal}>Отмена</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;