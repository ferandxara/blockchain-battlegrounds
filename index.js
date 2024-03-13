require('dotenv').config();
const { ethers } = require('ethers');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Contract } = require('ethers');
const PvPContractABI = require('./PvPContract.json');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const pvpContract = new Contract(process.env.PVP_CONTRACT_ADDRESS, PvPContractABI, provider);

io.on('connection', (socket) => {
  socket.on('start-battle', async (data) => {
    const { playerAddress } = data;
    const tx = await pvpContract.connect(playerAddress).initiateBattle();
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`Battle started for player: ${playerAddress}`);
      socket.emit('battle-status', { success: true, message: "Battle initiated successfully." });
    } else {
      socket.emit('battle-status', { success: false, message: "Failed to initiate battle." });
    }
  });
});

server.listen(3001, () => {
  console.log('Blockchain Battlegrounds running on http://localhost:3001');
});