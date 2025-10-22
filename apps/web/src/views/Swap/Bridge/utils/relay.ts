import { PublicKey, TransactionInstruction } from '@solana/web3.js'

export function convertStepsIntoTransactionInstruction(instructions: any[]): TransactionInstruction[] {
  return instructions.map((instruction) => {
    return new TransactionInstruction({
      keys: instruction.keys.map((key: any) => {
        return {
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        }
      }),
      programId: new PublicKey(instruction.programId),
      data: Buffer.from(instruction.data, 'hex'),
    })
  })
}
