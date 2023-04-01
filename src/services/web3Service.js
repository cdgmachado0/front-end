import Web3 from 'web3';
// abis
import Ozl_ABI from "../abi/FakeOZL.json"
import StorageBeacon_ABI from "../abi/StorageBeacon.json"
import OZERC1967Proxy_ABI from "../abi/ozERC1967Proxy.json"
import OZBeaconProxy_ABI from "../abi/ozAccountProxy.json"

import {
    MAINNET_CHAIND_ID,
    ARBITRUM_CHAIN_ID,
    GOERLI_CHAIN_ID
} from "../utils/constants"

import {
    REACT_APP_ARB_PROVIDER,
    REACT_APP_ARB_MAINNET_PROVIDER,
    REACT_APP_OZL_CONTRACT,
    REACT_APP_MAINNET_OZL_CONTRACT,
    REACT_APP_STORAGE_BEACON,
    REACT_APP_MAINNET_STORAGE_BEACON,
    REACT_APP_OZERC1967PROXY,
    REACT_APP_MAINNET_OZERC1967PROXY
} from "../state-vars.js";

// providers
const arbProvider = REACT_APP_ARB_PROVIDER;
const arbProviderMainnet = REACT_APP_ARB_MAINNET_PROVIDER;

// web3 instance
const web3_arb = new Web3(new Web3.providers.HttpProvider(arbProvider));
const web3_arb_main = new Web3(new Web3.providers.HttpProvider(arbProviderMainnet));

// contracts
const OZL = new web3_arb.eth.Contract(Ozl_ABI, REACT_APP_OZL_CONTRACT);
const OZL_Main = new web3_arb_main.eth.Contract(Ozl_ABI, REACT_APP_MAINNET_OZL_CONTRACT);

const STORAGE_BEACON = REACT_APP_STORAGE_BEACON
const STORAGE_BEACON_MAIN = REACT_APP_MAINNET_STORAGE_BEACON
const OZL_MAIN = REACT_APP_MAINNET_OZL_CONTRACT;

const OZERC1967PROXY = REACT_APP_OZERC1967PROXY
const OZERC1967PROXY_MAIN = REACT_APP_MAINNET_OZERC1967PROXY

// functions -- LANDING PAGE
export function fromAtomicUnit(wei) {
    return Web3.utils.fromWei(wei, 'ether');
}

export async function getBlockNumber() {
    try {
        if (window.ethereum.chainId === MAINNET_CHAIND_ID) {
            return await web3_arb_main.eth.getBlockNumber();
        } else {
            return await web3_arb.eth.getBlockNumber();
        }
    } catch { }
}

export async function getTotalVolumeInUSD() {
    const res = await OZL_Main.methods.getTotalVolumeInUSD().call();
    return fromAtomicUnit(res);
}

export async function getTotalVolumeInETH() {
    const res = await OZL_Main.methods.getTotalVolumeInETH().call();
    return fromAtomicUnit(res);
}

export async function getAUMWeth() {
    const res = await OZL_Main.methods.getAUM().call();
    return fromAtomicUnit(res[0]);
}

export async function getAUMValue() {
    const res = await OZL_Main.methods.getAUM().call();
    return fromAtomicUnit(res[1]);
}

// functions -- APP -- as in document
export async function balanceOf(address) {

    if (!address) return;

    try {
        if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
            const res = await OZL_Main.methods.balanceOf(address).call();
            return fromAtomicUnit(res)
        } else {
            const res = await OZL.methods.balanceOf(address).call();
            return fromAtomicUnit(res)
        }
    } catch { }
}

export async function getOzelBalances(address) {

    if (!address) return

    try {
        if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
            const res = await OZL_Main.methods.getOzelBalances(address).call();
            return [fromAtomicUnit(res[0]), fromAtomicUnit(res[1])]
        } else {
            const res = await OZL.methods.getOzelBalances(address).call();
            return [fromAtomicUnit(res[0]), fromAtomicUnit(res[1])]
        }
    } catch { }
}


function triageNetwork(l1ABI) {
    const web3_eth = new Web3(Web3.givenProvider);
    let contractAddress;
    let Contract;

    if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
        contractAddress = window.ethereum.chainId === MAINNET_CHAIND_ID ? STORAGE_BEACON_MAIN : STORAGE_BEACON
        Contract = new web3_eth.eth.Contract(l1ABI, contractAddress);
        // console.log("Contract MAINNET_CHAIND_ID");
        // console.log(Contract);
    } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
        contractAddress = OZL_MAIN;
        Contract = new web3_eth.eth.Contract(Ozl_ABI, contractAddress);
        // console.log("Contract ARBITRUM_CHAIN_ID");
        // console.log(Contract);
    }
    return Contract;
}

// functions -- WIDGET -- as in document
export async function getTokenDatabase() {
    try {
        const Contract = triageNetwork(StorageBeacon_ABI);
        const res = await Contract.methods.getTokenDatabase().call();
        return res;

    } catch { }
}

export async function getAccountsByUser(address) {

    if (!address) return

    try {
        const Contract = triageNetwork(StorageBeacon_ABI);
        const res = await Contract.methods.getAccountsByUser(address).call();
        return res;
    } catch { }
}

export async function createNewProxy(address, token, slippage, accountName) {
    try {
        // console.log(address, token, slippage, accountName);
        // console.log(Web3.givenProvider);
        // const Contract = triageNetwork(OZERC1967Proxy_ABI);
        // console.log("Contract", Contract);

        const ETH_ABI_CreateNewProxy = [{ "inputs": [{ "internalType": "address", "name": "ops_", "type": "address" }, { "internalType": "address", "name": "beacon_", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "string", "name": "nonZeroValue", "type": "string" }], "name": "CantBeZero", "type": "error" }, { "inputs": [], "name": "NameTooLong", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "unauthorizedUser", "type": "address" }], "name": "NotAuthorized", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "TokenNotInDatabase", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "beacon", "type": "address" }], "name": "BeaconUpgraded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "newOwner_", "type": "address" }], "name": "changeOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "slippage", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }], "internalType": "struct IStorageBeacon.AccountConfig", "name": "acc_", "type": "tuple" }], "name": "createNewProxy", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "proxiableUUID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }]

        const web3_eth = new Web3(Web3.givenProvider);
        let contractAddress;
        let Contract;
        if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
            contractAddress = window.ethereum.chainId === MAINNET_CHAIND_ID ? "0x44e2e47039616b8E69dC153add52C415f22Fab2b" : "0xCd9d0217D624B6E45cAEf2de453e7bF4DcFFE710"
            Contract = new web3_eth.eth.Contract(ETH_ABI_CreateNewProxy, contractAddress);
            // console.log("Contract MAINNET_CHAIND_ID");
            // console.log(Contract);
        } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
            contractAddress = OZL_MAIN;
            Contract = new web3_eth.eth.Contract(Ozl_ABI, contractAddress);
            // console.log("Contract ARBITRUM_CHAIN_ID");
            // console.log(Contract);
        }
        // console.log([address, token, parseInt(slippage * 100), accountName]);
        const res = await Contract.methods.createNewProxy([address, token, parseInt(slippage * 100), accountName]).send({ from: address });
        return res;
    } catch { }
}

// functions -- CHANGE -- as in document
export async function changeAccountToken(selectedAccount, token, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    let res;

    if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeAccountToken(token).send({ from: address })
            .then(data => {
                //   console.log(data);
                return data
            })
            .catch(err => {
                console.log(err);
            });
    } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeToken(token).send({ from: address })
            .then(data => {
                //   console.log(data);
                return data
            })
            .catch(err => {
                console.log(err);
            });
    }
    return res;
}

export async function changeAccountSlippage(selectedAccount, slippage, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    let res;

    if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeAccountSlippage(parseInt(slippage * 100)).send({ from: address });
    } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeSlippage(parseInt(slippage * 100)).send({ from: address });
    }
    return res;
}

export async function changeAccountTokenNSlippage(selectedAccount, token, slippage, address) {
    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, selectedAccount);
    let res;

    if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeAccountTokenNSlippage(token, parseInt(slippage * 100)).send({ from: address });
    } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
        res = await OZBeaconProxy.methods.changeTokenNSlippage(token, parseInt(slippage * 100)).send({ from: address });
    }
    return res;
}



// functions -- STATS -- as in document
// in progress
export async function getAccountPayments(address) {

    if (!address) return

    try {
        if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
            const res = await OZL_Main.methods.getAccountPayments(address).call();
            return fromAtomicUnit(res)
        } else {
            const res = await OZL.methods.getAccountPayments(address).call();
            return fromAtomicUnit(res)
        }
    } catch { }
}

export async function getAccountDetails(account) {

    if (!account) return;

    const web3_eth = new Web3(Web3.givenProvider);
    const OZBeaconProxy = new web3_eth.eth.Contract(OZBeaconProxy_ABI, account);
    let res;

    if (window.ethereum.chainId === MAINNET_CHAIND_ID || window.ethereum.chainId === GOERLI_CHAIN_ID) {
        res = await OZBeaconProxy.methods.getAccountDetails().call();
        // console.log("--------- 1 ----------");
        // console.log(OZBeaconProxy.methods);

    } else if (window.ethereum.chainId === ARBITRUM_CHAIN_ID) {
        res = await OZBeaconProxy.methods.getDetails().call();
        // console.log("--------- 2 ----------");
        // console.log(OZBeaconProxy.methods);

    }
    return res;
}

export async function getTxReceipt(txHash) {

    if (!txHash) return

    const web3_eth = new Web3(Web3.givenProvider);
    return await web3_eth.eth.getTransactionReceipt(txHash);
}