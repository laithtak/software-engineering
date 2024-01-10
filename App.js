import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [balance, setBalance] = useState(500000);
  const [transferAmount, setTransferAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [senders, setSenders] = useState([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]);
  const [selectedSender, setSelectedSender] = useState('');

  useEffect(() => {
    fetchBalance();
    fetchTransactionHistory();
    fetchSenders();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/transaction-history');
      setTransactionHistory(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const fetchSenders = async () => {
    // Assuming you have an API endpoint to fetch the list of senders
    try {
      const response = await axios.get('http://localhost:3001/api/senders');
      setSenders(response.data.senders);
    } catch (error) {
      console.error('Error fetching senders:', error);
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (amount && amount > 0 && selectedSender) {
      try {
        const response = await axios.post('http://localhost:3001/api/transfer', {
          sender: selectedSender,
          amount,
        });

        if (response.data.success) {
          // Refresh balance, transaction history, and senders after successful transfer
          fetchBalance();
          fetchTransactionHistory();
          fetchSenders();
        } else {
          console.error('Transfer failed:', response.data.error);
        }
      } catch (error) {
        console.error('Error transferring funds:', error);
      }
    }
  };

  return (
    <div>
      <h1>Banking System</h1>
      <p>Account Balance: ${balance}</p>
      <label>Select Sender:</label>
      <select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)}>
        <option value="" disabled>Select a sender</option>
        {senders.map((sender) => (
          <option key={sender} value={sender}>
            {sender}
          </option>
        ))}
      </select>
      <br />
      <label>Enter amount to transfer:</label>
      <input
        type="number"
        placeholder="Enter amount"
        value={transferAmount}
        onChange={(e) => setTransferAmount(e.target.value)}
      />
      <br />
      <button onClick={handleTransfer}>Transfer</button>
      <h2>Transaction History</h2>
      <ul>
        {transactionHistory.map((transaction, index) => (
          <li key={index}>
            {transaction.type === 'debit' ? '-' : '+'} ${transaction.amount} ({transaction.date})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
