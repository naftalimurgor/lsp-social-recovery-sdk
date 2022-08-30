# lsp-social-recovery-js
Account ownership recovery sdk built on top [Universal Profiles](https://docs.lukso.tech/standards/universal-profile/introduction/) and on [Lukso Testnet](https://docs.lukso.tech/networks/l16-testnet)

- [Installation](#installation)
- [Usage](#getting-started)

- [Development](#development)

Live example:
Youtube: 

## Team Members

1. - Github Profile: [Naftali Murgor](https://github.com/naftalimurgor)
- email: murgornaftali@gmail.com
2. Github Profile: [Collins Hue](https://github.com/collins_hue)

## Getting started

Installation

```bash
yarn add lsp-social-recovery
```
or if using npm
```bash
npm install --save lsp-social-recovery
```

Install [web3](https://github.com/ethereum/web3.js) too if not yet already.

## Getting Started
This sdk builds on the [Lukso Testnet](https://docs.lukso.tech/networks/l16-testnet) and uses Universal Profiles Browser extension [Universal Profiles Browser Extension](https://docs.lukso.tech/guides/browser-extension/install-browser-extension) please extension is installed to continue.

### 1. Initializing the sdk
To use the SDK:

```javascript
import SocialRecover from 'lsp-social-recovery'

const providerUrl = 'https://rpc.l16.lukso.network'

const provider = new HDWalletProvider({
  privateKeys: [process.env.PRIVATE_KEY],
  providerOrUrl: providerUrl,
  pollingInterval: 18000,
  shareNonce: false
})

const options = {
  provider: provider,
  account: '0x508234eA0600b837CD70332ab342f9BB3B4fF900'
}

const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
// or
const options = {
  provider: window.ethereum
  account: accounts[0]
}

const socialRecovery = new SocialRecovery(options)
```

### 2. Deploy SocialRecovery & BasicRecovery Contracts

```javascript
const main = async () => {
  const superGuardians = []
  try {
    await socialRecovery.deploy()
    // set secret phrase
    socialRecovery.setSecretPhrase('a secret phrase')
    // save privateKey
    socialRecovery.setPrivateKey(privateKey)
    // add super guardians
    socialRecovery.addSuperGuardians(superGuardians)

  } catch(err) {
    console.err(err)
  }
}
```
### 3. Recover account ownership( Signature verification)
a. Signature submission and verification
First strategy in recovering account ownership after initialization is to let added `superGuardians` sign messages and submit the message to be stored in the contract:
```javascript
const messageHash = web3.utils.sha3(message)
const signature = web3.eth.accounts.sign(messageHash)
await socialRecovery.addGuardianSignature(superGuardian: Address, signature: string)
```
Note: All guardians **must** submit a signed message to be used to recover the account in future.

b. Verifying signature
To recover the account, all superGuardians must verify their signatures individually:
```javascript
// guardian1
await socialRecovery.verifySignature(messageHash, signature)
// guardian2
await socialRecovery.verifySignature(messageHash, signature)
// guardian3
await socialRecovery.verifySignature(messageHash, signature)

// all after signature verifications, recover account privateKey
await socialRecovery.recoverPrivateKey(secretPhrase)
``` 
>> All signature verification request must be initiated by the individual `superGuardian` Universal Profiles

### 4. Vote-based account recovery
Another strategy is using vote-based method to recover universal account ownership based on [LSP11BasicSocialRecovery](https://github.com/lukso-network/lsp-smart-contracts/blob/fa8697a6454be8ef0c3ae5524c2a4bb9abfc7a29/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol)

```javascript
await socialRecovery.setScret('a secret')
await socialRecovery.addGuardian(guardianAddress)
await socialRecovery.voteToRecover(recoverProcessId)
// after guardian voting:
await socialRecover.recoverOwnership()
```

## Development

**Setup**

Clone this repo:
```bash
git clone https://github.com/naftalimurgor/social-recovery-js
```

Install dependencies:
```bash
cd social_recovery/
yarn install
```

**Build**

To build
```bash
yarn build
```

**Test**

To run the tests
```bash
yarn test
```

**Contributing**

Contributions welcome! Feel free to create a new issue or submit a Pull Request.