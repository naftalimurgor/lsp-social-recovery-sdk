import Web3 from "web3"
import { SocialRecovery } from '../core'

const HDWalletProvider = require('@truffle/hdwallet-provider')

describe('SocialRecover', () => {

  const providerUrl = 'https://rpc.l16.lukso.network'
  const provider = new HDWalletProvider({
    privateKeys: [process.env.PRIVATE_KEY],
    addressIndex: 0,
    numberOfAddresses: 10,
    providerOrUrl: providerUrl,
    pollingInterval: 18000,
    shareNonce: false
  })

  const options = {
    provider: provider,
    account: '0x3BEc5003Bf698Dc938aa17F13094509C3DF83C57'
  }

  let socialRecovery: SocialRecovery

  beforeAll(() => {
    socialRecovery = new SocialRecovery(options)
  })

  it('should initialize library with correct config', () => {
    expect(socialRecovery).toBeInstanceOf(SocialRecovery)
  })

  it('should deploy contract with the given signer', async () => {
    await socialRecovery.deploy()
    expect(socialRecovery.mySocialRecoveryAddress).toBeDefined()
  })

  it('should existing getGuardians', async () => {
    const guardians = await socialRecovery.getGuardians()
    expect(guardians).toBeArray()
  })

})