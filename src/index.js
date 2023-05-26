// import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.4.0/ethers.min.js";
import {ethers, keccak256, AbiCoder} from "./ethers.js"
import crypto from "crypto";
import {AES} from 'crypto-js';
// const crypto = await require('crypto');
// const crypto = window.crypto;
const chainId = await window.ethereum.chainId;
const loginButton = document.getElementById('loginButton')
const userWallet = document.getElementById('userWallet')
const registerButton = document.getElementById('registerButton')
const addKeyButton = document.getElementById('addKeyButton')
const userSignautre = document.getElementById('userSignautre')
const withdrawButton = document.getElementById('withdrawButton')

/// EIP 712 structural typed data
const domain = {
    name: 'Orderly',
    version: '1',
    chainId: chainId,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
}
const definedTypes = {
    "EIP712Domain": [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
    ],
    "Registration": [
        {name: "brokerId", type: "string"},
        {name: "chainId", type: "uint256"},
        {name: "userAddress", type: "address"},
        {name: "timestamp", type: "uint256"},
    ],
    "Withdraw": [
        {name: "brokerId", type: "string"},
        {name: "chainId", type: "uint256"},
        {name: "receiver", type: "address"},
        {name: "amount", type: "uint256"},
        {name: "nonce", type: "uint256"},
        {name: "timestamp", type: "uint256"},
    ],
    "AddOrderlyKey": [
        {name: "brokerId", type: "string"},
        {name: "chainId", type: "uint256"},
        {name: "userAddress", type: "address"},
        {name: "orderlyKey", type: "address"},
        {name: "timestamp", type: "uint256"},
        {name: "expiration", type: "uint256"},
    ],
}

const types = {
    "EIP712Domain": definedTypes["EIP712Domain"],
    "Registration": definedTypes["Registration"],
    "Withdraw": definedTypes["Withdraw"],
    "Add Key": definedTypes["Add Key"],
}

function toggleButton() {
    if (!window.ethereum) {
        loginButton.innerText = 'MetaMask is not installed'
        loginButton.classList.remove('bg-purple-500', 'text-white')
        loginButton.classList.add('bg-gray-500', 'text-gray-100', 'cursor-not-allowed')
        return false
    }

    loginButton.addEventListener('click', loginWithMetaMask)
}

async function loginWithMetaMask() {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        .catch((e) => {
            console.error(e.message)
            return
        })
    if (!accounts) {
        return
    }

    window.userWalletAddress = accounts[0]
    userWallet.innerText = window.userWalletAddress
    loginButton.innerText = 'Sign out of MetaMask'

    loginButton.removeEventListener('click', loginWithMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', signOutOfMetaMask)
    }, 200)

    registerButton.addEventListener('click', signRegistration)

    addKeyButton.addEventListener('click', signAPI)
    withdrawButton.addEventListener('click', signWithdraw)
}

async function signRegistration() {

// const apiKey = ethers.Wallet.createRandom();
// //should wait for cefi reponse and if registration succeed, then save the apiKey to local storage

    const primaryType = 'Registration'

    const eip712Data = getFormattedMsg(primaryType)
    const signature = await signEIP712(JSON.stringify(eip712Data))
    userSignautre.innerText = signature
    eip712Data["signature"] = signature
    verifyEIP712(eip712Data);
    console.log(eip712Data)

}

async function signAPI() {
    const primaryType = 'AddOrderlyKey'
    const eip712Data = getFormattedMsg(primaryType)
    const signature = await signEIP712(JSON.stringify(eip712Data))
    userSignautre.innerText = signature
    eip712Data["signature"] = signature
    verifyEIP712(eip712Data);
    console.log(eip712Data)
}

async function signWithdraw() {
    const primaryType = 'Withdraw'
    const eip712Data = getFormattedMsg(primaryType)
    const signature = await signEIP712(JSON.stringify(eip712Data))
    userSignautre.innerText = signature
    eip712Data["signature"] = signature
    verifyEIP712(eip712Data);
    console.log(eip712Data)
}


function getFormattedMsg(primaryType) {

    const typeDefinition = {"EIP712Domain": definedTypes["EIP712Domain"], [primaryType]: definedTypes[primaryType]}
    const brokerId = "woofi_dex"
    const timestamp = Date.now()
    const message = ((pType) => {
        switch (pType) {
            case 'Registration': {
                return {
                    "brokerId": brokerId,
                    "chainId": chainId,
                    "userAddress": window.userWalletAddress,
                    "timestamp": timestamp,
                }
            }
            case 'AddOrderlyKey': {
                const apiKey = ethers.Wallet.createRandom();
                const expiration = document.getElementById('expiration').value
                return {
                    "brokerId": brokerId,
                    "chainId": parseInt(chainId),
                    "userAddress": window.userWalletAddress,
                    "orderlyKey": apiKey.address,
                    "timestamp": timestamp,
                    "expiration": expiration,
                }
            }
            case 'Withdraw': {
                const tokenAmount = document.getElementById('tokenAmount').value
                const brokerId = "woofi_dex"
                const accountId = getAccountId(window.userWalletAddress, brokerId)
                console.log(`address: ${window.userWalletAddress}`)
                console.log(`brokerId: ${brokerId}`)
                console.log(`accountId: ${accountId}`)
                return {
                    "brokerId": brokerId,
                    "chainId": parseInt(chainId),
                    "receiver": window.userWalletAddress,
                    "amount": tokenAmount,
                    "nonce": getNonce(accountId),
                    "timestamp": timestamp,
                }
            }
            default: {
                throw new Error('Invalid primary type')
            }
        }
    })(primaryType)
    return {
        domain: domain,
        message: message,
        primaryType: primaryType,
        types: typeDefinition,
    }

}


async function signEIP712(msg) {
    const from = window.userWalletAddress
    const method = "eth_signTypedData_v4"
    const params = [from, msg]
    const signature = await window.ethereum.request({method, params})
    return signature
}

function verifyEIP712(eip712Data) {

    const domain = eip712Data["domain"]
    const type = {[eip712Data["primaryType"]]: eip712Data["types"][eip712Data["primaryType"]]}
    const message = eip712Data["message"]
    const signature = eip712Data["signature"]
    const recovered = ethers.verifyTypedData(domain, type, message, signature);
    console.log(`Recovered address: ${recovered}`)
}

function signOutOfMetaMask() {
    window.userWalletAddress = null
    userWallet.innerText = ''
    loginButton.innerText = 'Sign in with MetaMask'
    userSignautre.innerText = ''
    loginButton.removeEventListener('click', signOutOfMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', loginWithMetaMask)
    }, 200)
}

function generateKeyPair1() {
    const publicKey = "0xpublickey"
    const privateKey = "0xprivatekey"
    crypto.generateKeyPair('ed25519', 'pem', (res) => {
        console.log('res', res)
    })
    return [publicKey, privateKey]
}


function getNonce(accountId) {
    const nonce = 123
    return nonce
}


window.addEventListener('DOMContentLoaded', () => {
    toggleButton()
});

function getAccountId(address, brokerId) {
    const borkerIdHash = string2Bytes32(brokerId)
    // console.log(borkerIdHash)
    const abicoder = AbiCoder.defaultAbiCoder()
    const data = abicoder.encode(
        ['address', 'bytes32'],
        [address, borkerIdHash]
    )
    // console.log(data)
    return keccak256(data)
}

function string2Bytes32(rawBrokerId) {
    // console.log(rawBrokerId)
    // console.log(ethers.encodeBytes32String(rawBrokerId))
    return keccak256(ethers.encodeBytes32String(rawBrokerId))
}

generateKeyPair1();
