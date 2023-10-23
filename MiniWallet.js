require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

app.listen(3000,()=>{
    console.log("Server is running at 3000");
})

const Web3 = require('web3');

const apiKey = process.env['apiKey'];
const network = 'sepolia';

const node = `https://sepolia.infura.io/v3/${apiKey}`

const web3 = new Web3(node);

const createTransaction = async (accountTo, amount)=>{


// console.log(web3)

//Wallet like Metamask has the functionality to create a new account with random account address
//also the account holds its own private key

//generating account from that the ether will be sent
const privateKey = process.env['privateKey'];
const accountFrom = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log("Sender: ",accountFrom);

//function to sign the transaction
const createSignedTx = async(rawTx)=>{
    rawTx.gas = await web3.eth.estimateGas(rawTx);
    return await accountFrom.signTransaction(rawTx);
}


//function to send the signed transaction so that miners can verify and do ither stuffs
const sendSignedTx = async(signedTx)=>{
    const trans = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    // .then(console.log)
    return trans;
}

const amountToSend = amount//ether
const rawTx = {
    to: accountTo,
    value: web3.utils.toWei(amountToSend,"ether")//converting rther to wei
}
return createSignedTx(rawTx).then(sendSignedTx);

}

app.post('/signTransaction',async(req,res)=>{
    try{
        const requestData = req.body;
//         console.log(requestData);
        
        const _to = requestData.to;
        const _amount = requestData.amount;
        const transaction = await createTransaction(_to,_amount);

        // res.status(200).json("Transaction Successful")

        if(transaction){
            res.status(200).json({Transaction_Details: transaction})
        }else{
            res.status(500).json({message:"Internal Server Error"});    
        }
    }catch(err){
            res.status(400).json({message:"Transaction Failed"})
    }
})
