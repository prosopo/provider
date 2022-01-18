import {z} from "zod";
import {Hash} from "@polkadot/types/interfaces";

export type Dataset = {
    datasetId?: Hash | string | Uint8Array,
    captchas: Captcha[],
    format: CaptchaTypes,
    tree?: string[][]
}

export type Captcha = {
    captchaId?: string
    salt: string,
    items: any[],
    target: string,
    solution?: any
}

export type CaptchaSolution = {
    captchaId: string
    salt: string,
    solution: any
}

export enum CaptchaTypes { SelectAll = "SelectAll"}

export const CaptchaSchema = z.object({
    captchaId: z.union([z.string(), z.undefined()]),
    salt: z.string(),
    solution: z.number().array().optional(),
})

export const CaptchaWithIdAndSolutionSchema = z.object({
    captchaId: z.string(),
    salt: z.string(),
    solution: z.number().array(),
})

export const CaptchaImageSchema = z.object({
    path: z.string(),
    type: z.string()
})

export const SelectAllCaptchaSchema = CaptchaSchema.extend({
        solution: z.number().array().optional(),
        items: z.union([z.array(CaptchaImageSchema), z.string().array()]),
        target: z.string()
    }
)

export const SelectAllSolvedCaptchaSchema = CaptchaWithIdAndSolutionSchema.extend({
        solution: z.number().array(),
        items: z.union([z.array(CaptchaImageSchema), z.string().array()]),
        target: z.string()
    }
)

export const CaptchasSchema = z.array(SelectAllCaptchaSchema)

export const CaptchaSolution = z.object({
    captchaId: z.string(),
    solution: z.number().array(),
    salt: z.string()
})

export const CaptchaSolutionSchema = z.array(CaptchaSolution)

export const CaptchasSolvedSchema = z.array(SelectAllSolvedCaptchaSchema)

export const DatasetSchema = z.object({
    datasetId: z.string().optional(),
    captchas: CaptchasSchema,
    format: z.nativeEnum(CaptchaTypes),
    tree: z.array(z.array(z.string())).optional()
})





