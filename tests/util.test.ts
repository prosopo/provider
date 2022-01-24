import { encodeStringAddress, hexHash, shuffleArray } from '../src/util'
import { expect } from 'chai'

describe('UTIL FUNCTIONS', () => {
    it('does not modify an already encoded address', () => {
        expect(encodeStringAddress('5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL')).to.equal('5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL')
    })
    it('fails on an invalid address', () => {
        expect(function () { encodeStringAddress('xx') }).to.throw()
    })
    it('correctly encodes a hex string address', () => {
        expect(encodeStringAddress('0x1cbd2d43530a44705ad088af313e18f80b53ef16b36177cd4b77b846f2a5f07c')).to.equal('5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL')
    })
    it('shuffle function shuffles array', () => {
        expect(shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])).to.not.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
    it('correctly hex hashes a string', () => {
        expect(hexHash('https://localhost:8282')).to.equal('0x09fd51a0d9e0d07be9aaab0643e1152c22cd11d9d128235552d476256b7351de')
    })
})
