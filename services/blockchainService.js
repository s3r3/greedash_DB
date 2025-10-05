const Web3 = require("web3");
const web3 = new Web3("https://bsc-dataseed.binance.org/");

const EGD_CONTRACT_ADDRESS = "0xYourEGDContract"; 
const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF77548524699939b"; 

const EGD_ABI = [
  
];

module.exports = {
  web3,
  EGD_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  EGD_ABI,
};
