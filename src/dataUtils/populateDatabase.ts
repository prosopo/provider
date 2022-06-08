import {promiseQueue} from "../util";
import {exportDatabaseAccounts, IDatabaseAccounts} from "./DatabaseAccounts";
import DatabasePopulator, {
  IDatabasePopulatorMethods,
} from "./DatabasePopulator";

const AMOUNT = 3;

const msToSecString = (ms: number) => `${Math.round(ms / 100) / 10}s`;

export interface UserCount {
  provider: {
    count: number
    staked: number
    stakedWithDataset: number
  }
  dapp: {
    count: number,
    staked: number,
  }
  dappUser: {
    count: number
  }
}

const DEFAULT_USER_COUNT: UserCount = {
  provider: {
    count: 25,
    staked: 12,
    stakedWithDataset: 10
  },
  dapp: {
    count: 3,
    staked: 2,
  },
  dappUser: {
    count: 2
  }
}

async function populateStep(
  databasePopulator: DatabasePopulator,
  key: keyof IDatabasePopulatorMethods,
  text: string,
  userCount: number
) {
  const startDate = Date.now();

  process.stdout.write(text);

  const dummyArray = new Array(AMOUNT).fill(userCount)
  const promise = await promiseQueue(
    dummyArray.map(() => () => databasePopulator[key]())
  );

  const time = Date.now() - startDate;

  process.stdout.write(` [ ${msToSecString(time)} ]\n`);

  promise
    .filter(({error}) => error)
    .forEach(({error}) => console.error(["ERROR", error]));
}

export async function populateDatabase(userCount: UserCount): Promise<IDatabaseAccounts> {


  console.log("Starting database populator...");
  const databasePopulator = new DatabasePopulator();

  await databasePopulator.isReady();

  await populateStep(
    databasePopulator,
    "registerProvider",
    "Adding providers...",
    userCount.provider.count
  );
  await populateStep(
    databasePopulator,
    "registerProviderWithStake",
    "Adding providers with stake...",
    userCount.provider.staked
  );
  await populateStep(
    databasePopulator,
    "registerProviderWithStakeAndDataset",
    "Adding providers with stake and dataset...",
    userCount.provider.stakedWithDataset
  );
  await populateStep(databasePopulator, "registerDapp", "Adding dapps...", userCount.dapp.count);
  await populateStep(
    databasePopulator,
    "registerDappWithStake",
    "Adding dapps with stake...",
    userCount.dapp.staked
  );
  await populateStep(
    databasePopulator,
    "registerDappUser",
    "Adding dapp users...",
    userCount.dappUser.count
  );

  console.log("Exporting accounts...");
  await exportDatabaseAccounts(databasePopulator);

  return databasePopulator;
}

if (require.main === module) {
  const startDate = Date.now();
  populateDatabase(DEFAULT_USER_COUNT)
    .then(() =>
      console.log(`Database population successful after ${msToSecString(Date.now() - startDate)}`)
    )
    .catch(console.error)
    .finally(() => process.exit());
}
