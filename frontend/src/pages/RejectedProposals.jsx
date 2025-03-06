import React, { useState, useEffect } from "react";

const RejectedProposals = () => {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch("");
        const data = await response.json();
        setProposals(data);
      } catch (error) {
        console.error("Error fetching rejected proposals:", error);
      }
    };

    fetchProposals();
  }, []);

  return (
    <div>
      <h2>Отклонённые предложения</h2>
      {proposals.map((proposal, index) => (
        <div key={index}>
          <h2>{proposal.title}</h2>
          <p>{proposal.body}</p>
        </div>
      ))}
    </div>
  );
};

export default RejectedProposals;