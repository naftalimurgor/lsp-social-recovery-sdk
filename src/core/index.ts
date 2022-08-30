import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import SocialRecoveryMetadata from '../abis/SocialRecovery.metadata'

/**
 * Typical Ethereum/EVM address.
 */
type Address = string

/**
 * Options to pass to the SocialRecovery class constructor.
 * @param {provider} A provider with a Signer capability to sign and broadcast transactions.
 * @param {string} account current Account to whiche SocialRecovery contract will be deployed to.
 */
type Options = {
  provider: provider,
  account: Address
}

/**
 * A GuardianVote object.
 * @param {Address} Guardians address.
 * @param {number} recoverProcessId for a guardian.
 */
type GuardianVote = {
  address: Address
  recoverProcessId: string
}

/**
 * An Array of guardian vote data
 */
type GuardianVotes = Array<GuardianVote>

/**
 * SocialRecovery class
 * @param {Options} options to pass to the constructor.
 */
export class SocialRecovery {
  private _web3: Web3
  private _account: Address
  public mySocialRecoveryAddress!: Address

  constructor(options: Options) {
    this._web3 = new Web3(options.provider)
    this._account = options.account
  }

  /**
   * deploy contract: https://github.com/naftalimurgor/social-recovery-contracts/blob/main/contracts/SocialRecovery.sol
   * @memberof SocialRecovery
   */
  public deploy = async () => {
    const { abi, bytecode } = SocialRecoveryMetadata
    const _deployContract = new this._web3.eth.Contract(abi as AbiItem[] | AbiItem)
    const tx = {
      from: this._account,
    }

    try {
      _deployContract.deploy({ data: bytecode, arguments: [this._account] })
        .send(tx)
        .on('receipt', (txResult) => {
          this.mySocialRecoveryAddress = txResult.contractAddress as string
          console.log('receipt!: ', txResult)
        })
    } catch (error) {
      console.error(error)
    }
  }


  // -- Begin contract methods
  /**
   * @returns Promise<Array<string>> of guardians
   *
   * @memberof SocialRecovery
   */
  public getGuardians = async (): Promise<Array<string>> => {
    const contractInstance = this._getContractInstance()
    try {
      const guardians = await contractInstance.methods.getGuardians()
      return guardians
    } catch (error) {
      throw new Error(`Failed to get guardians with ${error}`)
    }
  }


  /**
   * @param {string} existingGuardian Adress of existing guardian
   * @memberof SocialRecovery
   * @returns Promise<boolean>
   */
  public isGuardian = async (existingGuardian: string): Promise<boolean> => {
    const contractInstance = this._getContractInstance()
    try {
      const isGuardian = await contractInstance.methods.isGuardian(existingGuardian)
      return isGuardian
    } catch (error) {
      throw new Error(`Failed to check address ${existingGuardian} with: ${error}`)
    }

  }

  /**
   *
   * @returns Promise<Array<number>> of processIds
   * @memberof SocialRecovery
   */
  public getProcessIds = async (): Promise<Array<number>> => {
    const contractInstance = this._getContractInstance()
    try {
      const processIds = await contractInstance.methods.getProcessIds()
      return processIds
    } catch (error) {
      throw new Error(`Failed to getProcessIds with: ${error}`)
    }
  }

  /**
   * @returns {number} threshold/max number fo guardians
   * @memberof SocialRecovery
   */
  public getGuardianThreshold = async (address: Address): Promise<boolean> => {
    const contractInstance = this._getContractInstance()
    try {
      const threshold = await contractInstance.methods.getGuardianThreshold(address)
      return threshold
    } catch (error) {
      throw new Error(`Failed to check address ${address} with: ${error}`)
    }

  }

  /**
   *
   * @returns {string} guardianVote
   * @memberof SocialRecovery
   */
  public getGuardianVote = async (recoverProcessId: number, guardian: string): Promise<string> => {
    const contractInstance = this._getContractInstance()
    try {
      const guardianVote = await contractInstance.methods.getGuardianVote(recoverProcessId, guardian)
      return guardianVote
    } catch (error) {
      throw new Error(`Failed to getGuardan vote  for ${guardian} with: ${error}`)
    }
  }

  /**
   * @param {GuardianVotes} guardians array of guardian data.
   */
  public mutipleGuardianVote = async (guardians: GuardianVotes) => {
    const contractInstance = this._getContractInstance()

    try {
      const guardianThreshold = await contractInstance.methods.getGuardianThreshold()
      if (guardians.length > guardianThreshold) {
        throw new Error(`guardians provided exceed threshold of: ${guardianThreshold}`);
      }

      let voteCount = 0
      guardians.forEach(async (guardian) => {
        try {
          await contractInstance.methods.guardianVote(guardian.recoverProcessId, guardian.address)
          voteCount++
        } catch (error) {
          console.log(`Failed to vote:,`, guardian.address)
        }
      })

      return voteCount
    } catch (error) {
      throw new Error('Failed to add multiple votes');
    }
  }

  /** @param {string} newGuardian.
   * add a guardian.
   * @memberof SocialRecovery.
   * 
   */
  public addGuardian = async (newGuardian: string): Promise<boolean> => {
    const contractInstance = this._getContractInstance()
    try {
      const isGuardian = await contractInstance.methods.addGuardian(newGuardian)
      return isGuardian
    } catch (error) {
      throw new Error(`Failed to add new guardian address: ${newGuardian} with: ${error}`)
    }

  }

  /**
   * @param {string} address.
   * @memberof SocialRecovery.
   * 
   */
  public removeGuardian = async (address: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.removeGuardian(address)
    } catch (error) {
      throw new Error(`Failed to remove guardian of address ${address} with: ${error}`)
    }
  }

  /**
   * @param {string} newThreshold.
   * sets number of maximum number of guardians.
   * @memberof SocialRecovery.
   */
  public setThreshold = async (newThreshold: number): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      const isGuardian = await contractInstance.methods.setThreshold(newThreshold)
      return isGuardian
    } catch (error) {
      throw new Error(`Failed to set new Threshold of: ${newThreshold} with: ${error}`)
    }
  }

  /**
   * @param {string} secret
   * set a secret for recovering account ownership
   * @memberof SocialRecovery
   */
  public setSecret = async (secret: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.setSecret(secret)
    } catch (error) {
      throw new Error(`Failed to set new secret: ${secret} with: ${error}`)
    }
  }

  /**
   * @param {number} recoverProcessId unique processId for voting for recovering address
   * @param {string} address for voting to recover 
   * @memberof SocialRecovery
   */
  public voteToRecover = async (recoverProcessId: string, address: Address): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.voteToRecover(recoverProcessId, address)

    } catch (error) {
      throw new Error(`Failed to check address ${address} with: ${error}`)
    }
  }

  /**
   * @param {number} recoverProcessId
   * @param {string} plainSecret
   * @param {string} newHash
   * @memberof SocialRecovery
   */
  public recoverOwnership = async (
    recoverProcessId: string,
    plainSecret: string,
    newHash: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.recoverOwnership(recoverProcessId, plainSecret, newHash)
    } catch (error) {
      throw new Error(`Failed to recoverOwnership ${recoverProcessId} with: ${error}`)
    }
  }

  //-- end of base Contract Methods wrappers: https://github.com/lukso-network/lsp-smart-contracts/blob/fa8697a6454be8ef0c3ae5524c2a4bb9abfc7a29/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol
  // start of signature based account recovery
  // https://github.com/naftalimurgor/social-recovery-contracts/blob/main/contracts/SocialRecoveryCore.sol
  public setSecretHash = async (secretHash: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.setSecretHash(secretHash)
    } catch (error) {
      throw new Error(`Failed to set new secretHash: ${secretHash} with: ${error}`)
    }
  }

  public addGuardianSignature = async (superGuardian: Address, signature: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.addGuardianSignature(superGuardian, signature)
    } catch (error) {
      throw new Error(`Failed add new signature with: ${error}`)
    }
  }

  /**
   * @param {string} superguardian address to remove.
   * @memberof SocialRecovery
   */
  public removeGuardianSignature = async (guardianAddress: Address): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.removeGuardianSignature(guardianAddress)
    } catch (error) {
      throw new Error(`Failed to set new secretHash with: ${error}`)
    }
  }


  /**
   *
   * @param {string} superGuardian address.
   * @memberof SocialRecovery
   */
  public addSuperguardian = async (superGuardian: Address): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.addSuperguardian(superGuardian)
    } catch (error) {
      throw new Error(`Failed add new signature with: ${error}`)
    }
  }

  /**
   * @returns {Array} an array of all guardians.
   *
   * @memberof SocialRecovery
   */
  public getSuperGuardians = async (): Promise<Array<Address>> => {
    const contractInstance = this._getContractInstance()
    try {
      const superguadians = await contractInstance.methods.getSuperGuardians()
      return superguadians
    } catch (error) {
      throw new Error(`Failed add new signature with: ${error}`)
    }
  }

  public removeSuperGuardian = async (existingGuardian: Address): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.removeGuardian(existingGuardian)
    } catch (error) {
      throw new Error(`Failed to removeSuperGuardian: ${existingGuardian} with: ${error}`)
    }
  }

  /**
   * @returns {string} guardian's stored signature.
   *
   * @memberof SocialRecovery
   */
  public retrieveSignature = async (superGuardian: Address, secretPhrase: string): Promise<string> => {
    const contractInstance = this._getContractInstance()
    try {
      const signature = await contractInstance.methods.retrieveSignature(superGuardian, secretPhrase)
      return signature
    } catch (error) {
      throw new Error(`Failed retrieve signature with: ${error}`)
    }
  }


  /**
   * set max number of required signature verification count.
   * internally sets the threshold to number of guardians
   * @memberof SocialRecovery
   */
  public setSignatureThreshold = async (): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.setSignatureThreshold()
    } catch (error) {
      throw new Error(`Failed setSignatureThreshold with: ${error}`)
    }
  }

  /**
   * @param {string} messageHash keccak256 encoded string
   * @param {string} signature keccak256 encoded message hash signed with eth_sign rpc method
   *
   * @memberof SocialRecovery
   */
  public verifySignature = async (messageHash: string, signature: string): Promise<void> => {
    const contractInstance = this._getContractInstance()
    try {
      await contractInstance.methods.verifSignature(messageHash, signature)
    } catch (error) {
      throw new Error(`Failed to verify signature with: ${error}`)
    }
  }


  /**
   * 
   * @returns {number} max number of required verified signatures to retrieve a private key
   * @memberof SocialRecovery
   */
  public getSignatureThreshold = async (): Promise<number> => {
    const contractInstance = this._getContractInstance()
    try {
      const signatureThreshold = await contractInstance.methods.getSignatureThreshold()
      return signatureThreshold
    } catch (error) {
      throw new Error(`Failed retrieve signatureThreshold with: ${error}`)
    }
  }


  /**
   * @returns {string} account privateKey
   * retrieve a privateKey after all signature verifications.
   * @memberof SocialRecovery
   */
  public recoverPrivateKey = async (secretPhrase: string): Promise<string> => {
    const contractInstance = this._getContractInstance()
    try {
      const privateKey = await contractInstance.methods.recoverPrivateKey(secretPhrase)
      return privateKey
    } catch (error) {
      throw new Error(`Failed retrieve privateKeys with: ${error}`)
    }
  }
  // end of custom SocialRecovery contract methods: https://github.com/naftalimurgor/social-recovery-contracts/blob/main/contracts/SocialRecoveryCore.sol 

  // -- internal helper methods
  private _getContractInstance = (): Contract => {
    const { abi } = SocialRecoveryMetadata
    return new this._web3.eth.Contract(abi as AbiItem | AbiItem[], this.mySocialRecoveryAddress)
  }
}
