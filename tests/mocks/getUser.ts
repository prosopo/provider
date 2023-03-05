// Create a user of specified type using the databasePopulator
import { ProsopoEnvironment } from '../../src/index'
import { AccountKey, IDatabaseAccounts } from '../dataUtils/DatabaseAccounts'
import { populateDatabase } from '../dataUtils/populateDatabase'
import { ProsopoEnvError } from '@prosopo/common'
import { Account } from './accounts'

export async function getUser(env: ProsopoEnvironment, accountType: AccountKey): Promise<Account> {
    const accountConfig = Object.assign({}, ...Object.keys(AccountKey).map((item) => ({ [item]: 0 })))
    accountConfig[accountType] = 1
    const databaseAccounts: IDatabaseAccounts = await populateDatabase(env, accountConfig, false)
    const account = databaseAccounts[accountType].pop()
    if (account === undefined) {
        throw new ProsopoEnvError(new Error(`${accountType} not created by databasePopulator`))
    }
    return account
}