import express, {Router} from 'express';
import {Tasks} from './tasks/tasks'
import {BadRequest, ERRORS} from './errors'
import {shuffleArray} from "./util";
import {parseCaptchas} from "./captcha";
import {CaptchaSolutionBody} from "./types/api";

/**
 * Returns a router connected to the database which can interact with the Proposo protocol
 *
 * @return {Router} - A middleware router that can interact with the Prosopo protocol
 * @param {Environment} env - The Prosopo environment
 */
export function prosopoMiddleware(env): Router {
    const router = express.Router();
    const tasks = new Tasks(env);
    /**
     * Register a Provider
     *
     * @return JSON result showing ProviderRegister event
     */
    router.post('/v1/prosopo/provider_register/', async function (req, res, next) {
        try {
            const {serviceOrigin, fee, payee, address} = req.body;
            if (!serviceOrigin || !fee || !payee || !address) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            let result = await tasks.providerRegister(serviceOrigin, fee, payee, address)
            res.json(result);

        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }

    });

    /**
     * Update a Provider
     *
     * @return JSON result showing ProviderUpdate event
     */
    router.post('/v1/prosopo/provider_update/', async function (req, res, next) {
        try {
            const {serviceOrigin, fee, payee, address, value} = req.body;
            if (!serviceOrigin || !fee || !payee || !address) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            const result = await tasks.providerUpdate(serviceOrigin, fee, payee, address, value);
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });

    /**
     * Deregister a Provider
     *
     * @return JSON result showing ProviderDeregister event
     */
    router.post('/v1/prosopo/provider_deregister/', async function (req, res, next) {
        try {
            const address: string = req.body.address;
            if (!address) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            const result = await tasks.providerDeregister(address)
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });


    /**
     * Provider unstake
     *
     * @return JSON result showing ProviderUnstake event
     */
    router.post('/v1/prosopo/provider_unstake/', async function (req, res, next) {
        try {
            const {value} = req.body;
            if (!value) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            const result = await tasks.providerUnstake(value);
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });

    /**
     * Provider add data set
     *
     * @return JSON result showing ProviderAddDataset event
     */
    router.post('/v1/prosopo/provider_add_data_set/', async function (req, res, next) {
        try {
            const {file} = req.body;
            if (!file) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            let result = await tasks.providerAddDataset(file);
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });

    /**
     * Dapp register and Dapp update
     *
     * @return JSON result showing DappRegister|DappUpdate event
     */
    router.post('/v1/prosopo/dapp_(register|update)/', async function (req, res, next) {
        try {
            const {address, dappServiceOrigin, dappContractAddress, dappOwner} = req.body;
            if (!address || !dappServiceOrigin || !dappContractAddress) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            const result = await tasks.dappRegister(dappServiceOrigin, dappContractAddress, dappOwner)
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });


    /**
     * Dapp fund
     *
     * @return ...
     */
    router.post('/v1/prosopo/dapp_fund/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Dapp cancel
     *
     * @return ...
     */
    router.post('/v1/prosopo/dapp_cancel/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Dapp Deregister
     *
     * @return ...
     */
    router.post('/v1/prosopo/dapp_deregister/', async function (req, res, next) {
        //TODO
        next()
    });


    /**
     * Dapp User Commit
     *
     * @return ...
     */
    router.post('/v1/prosopo/dapp_user_commit/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Provider Approve
     *
     * @return ...
     */
    router.post('/v1/prosopo/provider_approve/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Provider Disapprove
     *
     * @return ...
     */
    router.post('/v1/prosopo/provider_disapprove/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Allow Dapp Operator to check if user is human
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapp_operator_is_human_user/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Allow Dapp Operator check recent solution
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapp_operator_check_recent_solution/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Add operator
     *
     * @return ...
     */
    router.post('/v1/prosopo/add_prosopo_operator/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get captcha solution commitment
     *
     * @return ...
     */
    router.get('/v1/prosopo/captcha_solution_commitment/:solution_root', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get dapp user
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapp/:dapp_account', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Returns accounts of the providers
     *
     * @return {Hash} - The Providers
     */
    router.get('/v1/prosopo/providers/', async function (req, res, next) {
        await env.isReady();
        console.log(env.contract.api.consts)
        let result = await env.contract.query.getProviders();
        res.send(result.output);
    });

    /**
     * Returns details of the provider
     *
     * @param {string} provider_account - Provider's account
     * @return {Hash} - The Captcha Provider object
     */
    router.get('/v1/prosopo/provider/:provider_account', async function (req, res, next) {
        await env.isReady();
        const provider_account = req.params.provider_account;
        console.log(provider_account);
        let result = await env.contract.query.getProviderDetails(provider_account);
        res.send(result.output);
    });

    /**
     * Get dapps
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapps/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get dapp
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapp/:dapp_account', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get operators
     *
     * @return ...
     */
    router.get('/v1/prosopo/operators/', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get dapp balance
     *
     * @return ...
     */
    router.get('/v1/prosopo/dapp/balance/dapp_account', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Get provider balance
     *
     * @return ...
     */
    router.get('/v1/prosopo/provider/balance/provider_account', async function (req, res, next) {
        //TODO
        next()
    });

    /**
     * Provides a Captcha puzzle to a Dapp User
     *
     * @param {string} userId - Dapp User id
     * @param {string} dappId - Dapp Contract AccountId
     * @return {Captcha} - The Captcha data
     */
    router.get('/v1/prosopo/provider/captcha/:datasetId', async function (req, res, next) {
        try {
            const {datasetId} = req.params;
            if (!datasetId) {
                throw new BadRequest(ERRORS.API.PARAMETER_UNDEFINED.message);
            }
            //return one solved and one unsolved
            const solved = await tasks.getCaptchaWithProof(datasetId, true, 1)
            const unsolved = await tasks.getCaptchaWithProof(datasetId, false, 1)
            let result = shuffleArray([solved[0], unsolved[0]]);
            res.json(result);
        } catch (err: any) {
            let msg = `${ERRORS.CONTRACT.TX_ERROR.message}:${err}`;
            next(new BadRequest(msg));
        }
    });

    /**
     * Receives solved Captchas, store to database, and check against solution commitment
     *
     * @param {string} userAccount - Dapp User id
     * @param {string} dappAccount - Dapp Contract AccountId
     * @param {Captcha[]} captchas - The Captcha solutions
     * @return {CaptchaSolutionResponse} - The Captcha solution result and proof
     */
    router.post('/v1/prosopo/provider/solution', async function (req, res, next) {
        try {
            CaptchaSolutionBody.parse(req.body);
        } catch(err) {
            throw new BadRequest(err);
        }
        const {userAccount, dappAccount, captchas} = req.body;
        try {
            const result = await tasks.dappUserSolution(userAccount, dappAccount, captchas)
            if (result.length === 0) {
                res.json({status: ERRORS.API.CAPTCHA_FAILED.message, captchas: []})
            } else {
                res.json({status: ERRORS.API.CAPTCHA_PASSED.message, captchas: result});
            }
        } catch (err: any) {
            console.log(err);
            let msg = ERRORS.API.BAD_REQUEST.message;
            next(new BadRequest(msg));
        }
    });

    return router;
}