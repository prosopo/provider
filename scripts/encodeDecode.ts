import {decodeAddress, encodeAddress, isAddress} from '@polkadot/util-crypto'
import {hexToString, isHex, stringToHex, u8aToHex} from '@polkadot/util'

const ss58Format = 42 // TODO get this number from rpc
const bitLength = 128 // TODO get this number from rpc
const arg = process.argv.slice(2)[0].trim()
const argIsHex = isHex(arg, bitLength)
const argIsAddress = isAddress(arg, false, ss58Format)
// console.log(`arg is: ${arg}`)
// console.log(`argIsAddress of bitLength ${bitLength} : ${argIsAddress}`)
// console.log(`argIsHex of bitLength ${bitLength}     : ${argIsHex}`)

if (argIsAddress) {
  const encodedAddress = encodeAddress(decodeAddress(arg, false, ss58Format), ss58Format);

  if (encodedAddress === arg) {
    const hexAddress = u8aToHex(decodeAddress(encodedAddress, false, ss58Format))
    console.log(`Hex address ${hexAddress}`)
  } else {
    console.log(`Encoded address ${encodedAddress}`)
  }

} else if (argIsHex) {
  console.log(`Decoding hex ${arg} to string`)
  console.log(hexToString(arg))
} else {
  console.log(`Encoding string ${arg} to hex`)
  console.log(stringToHex(arg))
}

